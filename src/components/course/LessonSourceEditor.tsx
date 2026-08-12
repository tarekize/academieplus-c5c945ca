import { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

// Distingue un contenu déjà en HTML (ancien format, ou sauvegardé depuis
// InlineLessonEditor) d'un contenu Markdown+LaTeX : détermine quel moteur de
// rendu utiliser pour l'aperçu (renderPreview ci-dessous).
const isHtmlContent = (s: string) => /<\s*(html|body|head|!doctype)/i.test(s || '');

// --- Détection/édition d'un tableau Markdown sous le curseur --------------
// Un tableau Markdown est ici une suite de lignes contiguës commençant par
// "|", dont la 2e ligne est la ligne de séparation ("| --- | --- |").

const isTableLine = (line: string) => line.trim().startsWith('|');
// Reconnaît la ligne de séparation Markdown ("| --- | :---: |...") qui suit
// toujours l'en-tête d'un tableau : sert à confirmer qu'un bloc de lignes
// commençant par "|" est bien un tableau (et pas juste du texte avec des "|").
const isSeparatorLine = (line: string) => /^\s*\|?\s*:?-{1,}:?\s*(\|\s*:?-{1,}:?\s*)+\|?\s*$/.test(line);

// Découpe une ligne de tableau Markdown en cellules (retire les "|" de bord).
function splitRowCells(line: string): string[] {
  const withoutEdges = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return withoutEdges.split('|').map((c) => c.trim());
}

// Reconstruit une ligne de tableau Markdown à partir de ses cellules.
function buildRow(cells: string[]): string {
  return '| ' + cells.join(' | ') + ' |';
}

interface MarkdownTableCtx {
  lines: string[];
  start: number; // index de la ligne d'en-tête
  end: number; // index de la dernière ligne de données
  lineIndex: number; // ligne où se trouve le curseur
  colIndex: number; // colonne où se trouve le curseur
  numCols: number;
}

// Retrouve, à partir de la position du curseur dans le textarea, les bornes
// du tableau Markdown en cours d'édition (lignes de début/fin, ligne et
// colonne du curseur) — ou null si le curseur n'est pas dans un tableau.
// Utilisée par toutes les opérations d'édition de tableau ci-dessous.
function getMarkdownTableContext(content: string, cursorPos: number): MarkdownTableCtx | null {
  const lines = content.split('\n');
  let lineStartOffset = 0;
  let lineIndex = lines.length - 1;
  for (let i = 0; i < lines.length; i++) {
    const lineEnd = lineStartOffset + lines[i].length;
    if (cursorPos <= lineEnd) { lineIndex = i; break; }
    lineStartOffset = lineEnd + 1;
  }
  const cursorInLine = cursorPos - lineStartOffset;
  if (!isTableLine(lines[lineIndex] || '')) return null;

  let start = lineIndex;
  while (start > 0 && isTableLine(lines[start - 1])) start--;
  let end = lineIndex;
  while (end < lines.length - 1 && isTableLine(lines[end + 1])) end++;
  if (end - start < 1 || !isSeparatorLine(lines[start + 1])) return null;

  const numCols = Math.max(1, splitRowCells(lines[start]).length);

  const lineText = lines[lineIndex] || '';
  let pipesBefore = 0;
  for (let i = 0; i < Math.min(cursorInLine, lineText.length); i++) {
    if (lineText[i] === '|') pipesBefore++;
  }
  const colIndex = Math.min(Math.max(pipesBefore - 1, 0), numCols - 1);

  return { lines, start, end, lineIndex, colIndex, numCols };
}

// Rend l'aperçu à droite (ou l'affichage lecture seule) : HTML+math si le
// contenu est déjà en HTML, Markdown+LaTeX (rendu élève) sinon.
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
  const [tablePopoverOpen, setTablePopoverOpen] = useState(false);
  const [tableEditContext, setTableEditContext] = useState(false);
  const [tableRowsInput, setTableRowsInput] = useState('3');
  const [tableColsInput, setTableColsInput] = useState('3');

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

  // Repère en continu si le curseur est dans un tableau existant (au clic ou
  // à la navigation clavier dans le textarea), pour que le bouton "Tableau"
  // affiche le bon panneau dès le premier clic dessus.
  const updateTableEditContext = useCallback(() => {
    const el = textareaRef.current;
    const ctx = el ? getMarkdownTableContext(content, el.selectionStart ?? content.length) : null;
    setTableEditContext(!!ctx);
  }, [content]);

  // Insère un nouveau tableau à la taille choisie par le pédagogue dans le
  // panneau du bouton "Tableau", et place le curseur dans la 1re cellule
  // d'en-tête (et non après tout le bloc) pour pouvoir enchaîner
  // immédiatement sur les boutons d'ajout/suppression de ligne/colonne.
  const insertTable = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const rows = Math.min(50, Math.max(1, parseInt(tableRowsInput, 10) || 1));
    const cols = Math.min(20, Math.max(1, parseInt(tableColsInput, 10) || 1));
    const header = buildRow(Array.from({ length: cols }, (_, i) => `Colonne ${i + 1}`));
    const separator = buildRow(Array.from({ length: cols }, () => '---'));
    const dataRows = Array.from({ length: rows }, (_, r) =>
      buildRow(Array.from({ length: cols }, (_, c) => `Valeur ${r * cols + c + 1}`))
    );
    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const needsLeadingNewline = start > 0 && content[start - 1] !== '\n';
    const block = `${needsLeadingNewline ? '\n' : ''}\n${[header, separator, ...dataRows].join('\n')}\n`;
    const newValue = content.slice(0, start) + block + content.slice(end);
    onChange(newValue);
    setTablePopoverOpen(false);
    setTableEditContext(true);
    const tableStart = start + (needsLeadingNewline ? 2 : 1);
    const cursor = tableStart + 2; // juste après "| ", dans la 1re cellule d'en-tête
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  }, [content, onChange, tableRowsInput, tableColsInput]);

  // Toutes les opérations d'édition d'un tableau existant (ligne/colonne)
  // repèrent le tableau via la position du curseur dans le textarea, comme
  // wrapSelection/insertAtCursor ci-dessus.
  const withMarkdownTable = useCallback((fn: (ctx: MarkdownTableCtx) => string[]) => {
    const el = textareaRef.current;
    const ctx = getMarkdownTableContext(content, el?.selectionStart ?? content.length);
    if (!ctx) {
      toast.info("Placez le curseur dans une ligne du tableau à modifier.");
      return;
    }
    const newLines = fn(ctx);
    onChange(newLines.join('\n'));
    // On sait déjà qu'on est dans un tableau (ctx non null ci-dessus) : pas
    // besoin de recalculer via `content`, qui n'a pas encore été mis à jour
    // par ce `onChange` au moment où cette fonction s'exécute.
    setTableEditContext(true);
    requestAnimationFrame(() => el?.focus());
  }, [content, onChange]);

  // Ajoute une ligne de données vide au-dessus/en dessous de la ligne courante
  // (jamais avant la ligne de séparation, donc jamais au-dessus de l'en-tête).
  const addMarkdownRow = useCallback((position: 'above' | 'below') => {
    withMarkdownTable(({ lines, start, lineIndex, numCols }) => {
      const insertAt = lineIndex < start + 2 ? start + 2 : (position === 'above' ? lineIndex : lineIndex + 1);
      const newRow = buildRow(Array.from({ length: numCols }, () => ''));
      return [...lines.slice(0, insertAt), newRow, ...lines.slice(insertAt)];
    });
  }, [withMarkdownTable]);

  // Supprime la ligne de données courante ; refuse si le curseur est sur
  // l'en-tête ou la ligne de séparation (rien à supprimer là).
  const deleteMarkdownRow = useCallback(() => {
    withMarkdownTable(({ lines, start, lineIndex }) => {
      if (lineIndex < start + 2) {
        toast.info("Sélectionnez une ligne de données (pas l'en-tête) à supprimer.");
        return lines;
      }
      return [...lines.slice(0, lineIndex), ...lines.slice(lineIndex + 1)];
    });
  }, [withMarkdownTable]);

  // Ajoute une colonne à gauche/droite de la colonne courante, sur toutes les
  // lignes du tableau (en-tête, séparateur, données).
  const addMarkdownColumn = useCallback((position: 'left' | 'right') => {
    withMarkdownTable(({ lines, start, end, colIndex }) => {
      const insertIdx = position === 'left' ? colIndex : colIndex + 1;
      const newLines = [...lines];
      for (let i = start; i <= end; i++) {
        const cells = splitRowCells(lines[i]);
        cells.splice(insertIdx, 0, i === start + 1 ? '---' : i === start ? 'Colonne' : '');
        newLines[i] = buildRow(cells);
      }
      return newLines;
    });
  }, [withMarkdownTable]);

  // Supprime la colonne courante sur toutes les lignes ; refuse s'il n'en reste plus qu'une.
  const deleteMarkdownColumn = useCallback(() => {
    withMarkdownTable(({ lines, start, end, colIndex, numCols }) => {
      if (numCols <= 1) {
        toast.info('Le tableau doit garder au moins une colonne.');
        return lines;
      }
      const newLines = [...lines];
      for (let i = start; i <= end; i++) {
        const cells = splitRowCells(lines[i]);
        cells.splice(colIndex, 1);
        newLines[i] = buildRow(cells);
      }
      return newLines;
    });
  }, [withMarkdownTable]);

  // Supprime le tableau entier (toutes ses lignes, en-tête compris).
  const deleteMarkdownTable = useCallback(() => {
    withMarkdownTable(({ lines, start, end }) => [...lines.slice(0, start), ...lines.slice(end + 1)]);
  }, [withMarkdownTable]);

  // Le bouton "Ajouter une image" ouvre le sélecteur de fichiers de
  // l'appareil ; l'upload réel a lieu dans handleImageSelected ci-dessous.
  const insertImage = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  // Fichier choisi dans le sélecteur ouvert par insertImage : upload vers le
  // stockage lesson-media puis insertion du Markdown ![alt](url) correspondant.
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

        <Popover open={tablePopoverOpen} onOpenChange={setTablePopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={updateTableEditContext}
              title="Tableau"
              aria-label="Tableau"
            >
              <Table2 className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            {tableEditContext ? (
              <div>
                <p className="text-xs text-muted-foreground mb-2 px-1">
                  Modifier le tableau (curseur placé dans une ligne)
                </p>
                <div className="grid gap-0.5">
                  <button type="button" onClick={() => addMarkdownRow('above')} className="w-full text-left h-8 px-2 text-sm rounded hover:bg-muted">
                    Ajouter une ligne au-dessus
                  </button>
                  <button type="button" onClick={() => addMarkdownRow('below')} className="w-full text-left h-8 px-2 text-sm rounded hover:bg-muted">
                    Ajouter une ligne en dessous
                  </button>
                  <button type="button" onClick={deleteMarkdownRow} className="w-full text-left h-8 px-2 text-sm rounded hover:bg-muted">
                    Supprimer la ligne
                  </button>
                  <Separator className="my-1" />
                  <button type="button" onClick={() => addMarkdownColumn('left')} className="w-full text-left h-8 px-2 text-sm rounded hover:bg-muted">
                    Ajouter une colonne à gauche
                  </button>
                  <button type="button" onClick={() => addMarkdownColumn('right')} className="w-full text-left h-8 px-2 text-sm rounded hover:bg-muted">
                    Ajouter une colonne à droite
                  </button>
                  <button type="button" onClick={deleteMarkdownColumn} className="w-full text-left h-8 px-2 text-sm rounded hover:bg-muted">
                    Supprimer la colonne
                  </button>
                  <Separator className="my-1" />
                  <button type="button" onClick={deleteMarkdownTable} className="w-full text-left h-8 px-2 text-sm rounded hover:bg-muted text-destructive">
                    Supprimer le tableau
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-muted-foreground mb-2 px-1">Taille du tableau à insérer</p>
                <div className="flex items-end gap-2 mb-3">
                  <div className="flex-1">
                    <Label htmlFor="source-table-rows" className="text-xs text-muted-foreground">Lignes</Label>
                    <Input
                      id="source-table-rows"
                      type="number"
                      min={1}
                      max={50}
                      value={tableRowsInput}
                      onChange={(e) => setTableRowsInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && insertTable()}
                      className="h-8"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="source-table-cols" className="text-xs text-muted-foreground">Colonnes</Label>
                    <Input
                      id="source-table-cols"
                      type="number"
                      min={1}
                      max={20}
                      value={tableColsInput}
                      onChange={(e) => setTableColsInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && insertTable()}
                      className="h-8"
                    />
                  </div>
                </div>
                <Button type="button" size="sm" className="w-full" onClick={insertTable}>
                  Insérer
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
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
            onSelect={updateTableEditContext}
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
