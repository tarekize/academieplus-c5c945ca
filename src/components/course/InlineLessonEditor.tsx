import { useRef, useState, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sanitizeLessonHtml } from '@/lib/sanitizeHtml';
import { lessonSchema, convertPedagoBlocks } from '@/lib/lessonBlocks';
import { uploadLessonImage } from '@/lib/lessonMedia';
import { cn } from '@/lib/utils';
import { Loader2, Plus } from 'lucide-react';

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

// Échappe le texte avant de l'injecter dans un gabarit HTML construit à la
// main (insertHeading/insertBlock ci-dessous) : sans ça, un titre ou un texte
// sélectionné contenant "<"/">" casserait la structure du fragment inséré.
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
  /** Appelé à chaque frappe (avant même la synchronisation du HTML complet
   * via onChange), pour piloter un indicateur "modifications non enregistrées". */
  onDirty?: () => void;
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
  onDirty,
}: {
  initialContent: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  onFocusTarget?: (el: HTMLDivElement) => void;
  onBlurTarget?: () => void;
  onDirty?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Englobe la zone éditable : sert de repère (position:relative) pour
  // positionner les boutons "+" flottants au-dessus du tableau actif.
  const containerRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  // Curseur sauvegardé au moment d'ouvrir le sélecteur de fichiers : le temps
  // que le pédagogue choisisse une image et que l'upload se termine, le
  // focus est parti sur la boîte de dialogue du système puis revient — la
  // sélection dans la zone éditable serait perdue sans ça.
  const savedRangeRef = useRef<Range | null>(null);
  const [isEmpty, setIsEmpty] = useState(!initialContent?.trim());
  const [uploadingImage, setUploadingImage] = useState(false);
  const [tablePopoverOpen, setTablePopoverOpen] = useState(false);
  // Tableau HTML dans lequel se trouve le curseur (ou null) : pilote à la
  // fois le panneau du bouton "Tableau" (édition vs insertion) et la
  // position des boutons "+" flottants (ajout rapide de ligne/colonne).
  const [activeTable, setActiveTable] = useState<HTMLTableElement | null>(null);
  // Incrémenté après chaque ajout/suppression de ligne/colonne pour forcer
  // le recalcul de la position des boutons "+" (leur taille dépend du
  // tableau, qui vient de changer de dimensions).
  const [layoutTick, setLayoutTick] = useState(0);
  const [tableRowsInput, setTableRowsInput] = useState('3');
  const [tableColsInput, setTableColsInput] = useState('3');
  // Ligne/colonne actuellement sélectionnée via sa poignée (bande cliquable
  // au-dessus/à gauche du tableau), façon Excel : Suppr/Retour arrière la
  // supprime. Distinct de `activeTable` (qui suit juste le curseur texte).
  const [structSelection, setStructSelection] = useState<{ type: 'row' | 'col'; index: number } | null>(null);
  // Poignée survolée pendant un glisser-déposer (mise en évidence visuelle).
  const [dragOverHandle, setDragOverHandle] = useState<{ type: 'row' | 'col'; index: number } | null>(null);
  // Poignée en cours de glissement : une ref suffit, pas besoin de re-rendu.
  const dragFromRef = useRef<{ type: 'row' | 'col'; index: number } | null>(null);

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
    // Le surlignage de sélection ligne/colonne (classe posée directement sur
    // les <td>/<th> par selectColumn/selectRow) est un état d'édition
    // purement visuel : jamais dans le contenu réellement enregistré, sinon
    // les élèves verraient une colonne restée "surlignée" indéfiniment.
    ref.current?.querySelectorAll('.lesson-table-cell-selected').forEach((el) => {
      el.classList.remove('lesson-table-cell-selected');
    });
    const raw = ref.current?.innerHTML || '';
    setIsEmpty(!ref.current?.textContent?.trim());
    onChange(sanitizeLessonHtml(raw));
  }, [onChange]);

  // Gestionnaire du vrai blur DOM (contrairement à persist() seul, appelé
  // aussi après chaque clic sur la barre d'outils sans perte de focus réelle).
  const commit = useCallback(() => {
    persist();
    onBlurTarget?.();
  }, [persist, onBlurTarget]);

  const handleInput = useCallback(() => {
    setIsEmpty(!ref.current?.textContent?.trim());
    // Signale immédiatement qu'il y a une modification en cours (pour que
    // les boutons "Envoyer pour validation" / "Enregistrer" apparaissent dès
    // la frappe), sans synchroniser le HTML complet vers le
    // parent à chaque caractère — ça, c'est toujours `persist()` (au blur ou
    // via un bouton de la barre d'outils) qui s'en charge, cf. commentaire
    // plus haut sur `frozenHtml`.
    onDirty?.();
  }, [onDirty]);

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

  // Insère un titre h1/h2/h3 (numéroté automatiquement côté rendu élève) à
  // partir du texte sélectionné, ou d'un texte par défaut si rien n'est sélectionné.
  const insertHeading = useCallback((level: 1 | 2 | 3, defaultText: string) => {
    const text = escapeHtml(getSelectedText() || defaultText);
    insertHtmlAtCursor(`<h${level}>${text}</h${level}>`);
  }, [getSelectedText, insertHtmlAtCursor]);

  // Insère un bloc pédagogique (Définition/Propriété/Exemple) avec le même
  // balisage que le rendu élève (lesson-block / lesson-block-title / lesson-block-content).
  const insertBlock = useCallback((blockClass: string, blockTitle: string, defaultText: string) => {
    const text = escapeHtml(getSelectedText() || defaultText);
    insertHtmlAtCursor(
      `<div class="lesson-block ${blockClass}"><div class="lesson-block-title"><strong>${blockTitle}</strong></div><div class="lesson-block-content"><p>${text}</p></div></div>`
    );
  }, [getSelectedText, insertHtmlAtCursor]);

  // Insère une formule LaTeX en ligne ($...$) ou en bloc ($$...$$) : reste du
  // texte brut éditable (voir commentaire du composant), rendu en KaTeX
  // uniquement côté élève.
  const insertLatex = useCallback((display: boolean) => {
    const defaultFormula = display ? '\\int_a^b f(x)\\,dx' : 'x^2';
    const text = escapeHtml(getSelectedText() || defaultFormula);
    insertHtmlAtCursor(display ? `$$${text}$$` : `$${text}$`);
  }, [getSelectedText, insertHtmlAtCursor]);

  // Repère la cellule/ligne/tableau sous le curseur actuel (utilisé aussi bien
  // pour décider quel panneau afficher au clic sur le bouton "Tableau" que
  // pour cibler les opérations d'ajout/suppression de ligne ou colonne).
  const getTableContext = useCallback((): { table: HTMLTableElement; row: HTMLTableRowElement; colIndex: number } | null => {
    const el = ref.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0) return null;
    const node = sel.getRangeAt(0).commonAncestorContainer;
    if (!el.contains(node)) return null;
    const startEl = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
    const cell = startEl?.closest('td, th') as HTMLTableCellElement | null;
    const row = cell?.closest('tr') as HTMLTableRowElement | null;
    const table = cell?.closest('table') as HTMLTableElement | null;
    if (!cell || !row || !table || !el.contains(table)) return null;
    return { table, row, colIndex: Array.from(row.cells).indexOf(cell) };
  }, []);

  // Tient `activeTable` à jour en continu (clic ou navigation clavier dans
  // la zone éditable), pour que le bouton "Tableau" affiche le bon panneau
  // et que les boutons "+" flottants suivent le bon tableau — sans ça,
  // l'état ne serait calculé qu'au moment de cliquer sur le bouton
  // lui-même, un instant trop tard si la sélection a bougé entre-temps.
  const updateActiveTable = useCallback(() => {
    setActiveTable(getTableContext()?.table ?? null);
  }, [getTableContext]);

  // Repositionne les boutons "+" flottants si la fenêtre est redimensionnée
  // pendant qu'un tableau est actif (leur position est calculée à partir du
  // rectangle réel du tableau, qui bouge avec la mise en page).
  useEffect(() => {
    if (!activeTable) return;
    const handleResize = () => setLayoutTick((t) => t + 1);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTable]);

  // Le curseur a changé de tableau (ou en est sorti) : toute sélection de
  // ligne/colonne d'un tableau précédent n'a plus lieu d'être.
  useEffect(() => {
    setStructSelection(null);
  }, [activeTable]);

  // Enveloppe commune aux opérations d'ajout/suppression de ligne/colonne
  // déclenchées depuis le panneau du bouton "Tableau" : résout la cellule
  // active, applique la mutation DOM, puis persiste et force le recalcul de
  // la position des boutons "+"/poignées (layoutTick).
  const withTableContext = useCallback((fn: (ctx: { table: HTMLTableElement; row: HTMLTableRowElement; colIndex: number }) => void) => {
    const ctx = getTableContext();
    if (!ctx) {
      toast.info("Cliquez d'abord dans une cellule du tableau à modifier.");
      return;
    }
    fn(ctx);
    persist();
    setLayoutTick((t) => t + 1);
  }, [getTableContext, persist]);

  const addTableRow = useCallback((position: 'above' | 'below') => {
    withTableContext(({ table, row }) => {
      const insertIndex = position === 'above' ? row.rowIndex : row.rowIndex + 1;
      const numCols = row.cells.length;
      const newRow = table.insertRow(insertIndex);
      for (let i = 0; i < numCols; i++) {
        newRow.insertCell(i).innerHTML = '&nbsp;';
      }
    });
  }, [withTableContext]);

  const deleteTableRow = useCallback(() => {
    withTableContext(({ table, row }) => {
      if (table.rows.length <= 1) {
        toast.info('Le tableau doit garder au moins une ligne.');
        return;
      }
      table.deleteRow(row.rowIndex);
    });
  }, [withTableContext]);

  const addTableColumn = useCallback((position: 'left' | 'right') => {
    withTableContext(({ table, colIndex }) => {
      const insertIndex = position === 'left' ? colIndex : colIndex + 1;
      Array.from(table.rows).forEach((r) => {
        const isHeaderRow = r.cells.length > 0 && Array.from(r.cells).every((c) => c.tagName === 'TH');
        const cell = document.createElement(isHeaderRow ? 'th' : 'td');
        cell.innerHTML = '&nbsp;';
        r.insertBefore(cell, r.cells[insertIndex] || null);
      });
    });
  }, [withTableContext]);

  const deleteTableColumn = useCallback(() => {
    withTableContext(({ table, colIndex }) => {
      if (table.rows[0] && table.rows[0].cells.length <= 1) {
        toast.info('Le tableau doit garder au moins une colonne.');
        return;
      }
      Array.from(table.rows).forEach((r) => {
        if (r.cells[colIndex]) r.deleteCell(colIndex);
      });
    });
  }, [withTableContext]);

  const deleteTableEl = useCallback(() => {
    withTableContext(({ table }) => {
      table.remove();
    });
    setActiveTable(null);
  }, [withTableContext]);

  // Boutons "+" flottants (coin haut-gauche = colonne, coin bas-droit =
  // ligne) : ajoutent toujours à la toute fin du tableau, indépendamment de
  // la cellule où se trouve le curseur (contrairement à addTableRow/
  // addTableColumn ci-dessus, utilisées par le panneau du bouton "Tableau"
  // pour un positionnement précis au-dessus/en dessous, à gauche/à droite).
  const appendTableColumn = useCallback(() => {
    withTableContext(({ table }) => {
      Array.from(table.rows).forEach((r) => {
        const isHeaderRow = r.cells.length > 0 && Array.from(r.cells).every((c) => c.tagName === 'TH');
        const cell = document.createElement(isHeaderRow ? 'th' : 'td');
        cell.innerHTML = '&nbsp;';
        r.appendChild(cell);
      });
    });
  }, [withTableContext]);

  const appendTableRow = useCallback(() => {
    withTableContext(({ table }) => {
      const numCols = table.rows[0]?.cells.length ?? 0;
      const newRow = table.insertRow(-1);
      for (let i = 0; i < numCols; i++) {
        newRow.insertCell(i).innerHTML = '&nbsp;';
      }
    });
  }, [withTableContext]);

  // --- Sélection/suppression/déplacement de ligne ou colonne, façon tableur —
  // via les poignées (bandes cliquables) au-dessus/à gauche du tableau actif.

  const clearStructHighlight = useCallback((table: HTMLTableElement) => {
    table.querySelectorAll('.lesson-table-cell-selected').forEach((el) => el.classList.remove('lesson-table-cell-selected'));
  }, []);

  const clearStructSelection = useCallback(() => {
    if (activeTable) clearStructHighlight(activeTable);
    setStructSelection(null);
  }, [activeTable, clearStructHighlight]);

  // Clique sur une poignée de colonne : surligne toute la colonne (comme
  // cliquer sur une lettre de colonne dans Excel), pour ensuite la
  // supprimer via la touche Suppr/Retour arrière.
  const selectColumn = useCallback((index: number) => {
    if (!activeTable) return;
    clearStructHighlight(activeTable);
    Array.from(activeTable.rows).forEach((r) => r.cells[index]?.classList.add('lesson-table-cell-selected'));
    setStructSelection({ type: 'col', index });
  }, [activeTable, clearStructHighlight]);

  const selectRow = useCallback((index: number) => {
    if (!activeTable) return;
    clearStructHighlight(activeTable);
    const row = activeTable.rows[index];
    if (row) Array.from(row.cells).forEach((c) => c.classList.add('lesson-table-cell-selected'));
    setStructSelection({ type: 'row', index });
  }, [activeTable, clearStructHighlight]);

  const deleteColumnAt = useCallback((index: number) => {
    if (!activeTable) return;
    if ((activeTable.rows[0]?.cells.length ?? 0) <= 1) {
      toast.info('Le tableau doit garder au moins une colonne.');
      return;
    }
    Array.from(activeTable.rows).forEach((r) => {
      if (r.cells[index]) r.deleteCell(index);
    });
    persist();
    setLayoutTick((t) => t + 1);
    setStructSelection(null);
  }, [activeTable, persist]);

  const deleteRowAt = useCallback((index: number) => {
    if (!activeTable) return;
    if (activeTable.rows.length <= 1) {
      toast.info('Le tableau doit garder au moins une ligne.');
      return;
    }
    activeTable.deleteRow(index);
    persist();
    setLayoutTick((t) => t + 1);
    setStructSelection(null);
  }, [activeTable, persist]);

  // Suppr/Retour arrière pendant qu'une poignée a le focus (donc qu'une
  // ligne/colonne est sélectionnée) supprime la ligne/colonne — comme dans
  // un tableur. Échap annule juste la sélection.
  const handleStripKeyDown = useCallback((e: React.KeyboardEvent, type: 'row' | 'col', index: number) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      if (type === 'col') deleteColumnAt(index); else deleteRowAt(index);
    } else if (e.key === 'Escape') {
      (e.target as HTMLElement).blur();
    }
  }, [deleteColumnAt, deleteRowAt]);

  const moveTableColumn = useCallback((table: HTMLTableElement, from: number, to: number) => {
    if (from === to) return;
    Array.from(table.rows).forEach((row) => {
      const cell = row.cells[from];
      if (!cell) return;
      row.removeChild(cell);
      const cells = Array.from(row.cells);
      row.insertBefore(cell, to >= cells.length ? null : cells[to]);
    });
  }, []);

  const moveTableRow = useCallback((table: HTMLTableElement, from: number, to: number) => {
    if (from === to) return;
    const rowNode = table.rows[from];
    if (!rowNode) return;
    rowNode.remove();
    const remaining = Array.from(table.rows);
    const refNode = to >= remaining.length ? null : remaining[to];
    const parent = refNode ? refNode.parentElement! : (table.tBodies[0] ?? table);
    parent.insertBefore(rowNode, refNode);
  }, []);

  // Glisser-déposer d'une poignée : déplace la ligne/colonne à l'endroit
  // déposé (les autres se décalent), façon réorganisation de colonnes/lignes
  // dans un tableur.
  const handleStripDrop = useCallback((type: 'row' | 'col', targetIndex: number) => {
    setDragOverHandle(null);
    const from = dragFromRef.current;
    dragFromRef.current = null;
    if (!from || !activeTable || from.type !== type || from.index === targetIndex) return;
    if (type === 'col') moveTableColumn(activeTable, from.index, targetIndex);
    else moveTableRow(activeTable, from.index, targetIndex);
    persist();
    setLayoutTick((t) => t + 1);
    clearStructSelection();
  }, [activeTable, moveTableColumn, moveTableRow, persist, clearStructSelection]);

  // Insère un nouveau tableau à la taille choisie par le pédagogue (bouton
  // "Insérer" du panneau). Restaure d'abord le curseur sauvegardé à
  // l'ouverture du panneau, car cliquer dans les champs "Lignes"/"Colonnes"
  // fait perdre la sélection dans la zone éditable. Replace ensuite le
  // curseur DANS la première cellule du tableau créé (et non juste après),
  // pour pouvoir enchaîner immédiatement sur les boutons d'ajout/suppression
  // de ligne/colonne sans avoir à recliquer dans le tableau.
  const insertTable = useCallback(() => {
    const el = ref.current;
    const sel = window.getSelection();
    if (el && sel && savedRangeRef.current) {
      el.focus();
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
    const rows = Math.min(50, Math.max(1, parseInt(tableRowsInput, 10) || 1));
    const cols = Math.min(20, Math.max(1, parseInt(tableColsInput, 10) || 1));
    const markerId = `tbl-${Date.now()}`;
    const headerCells = Array.from({ length: cols }, (_, i) => `<th>Colonne ${i + 1}</th>`).join('');
    const bodyRows = Array.from({ length: rows }, (_, r) =>
      `<tr>${Array.from({ length: cols }, (_, c) => `<td>Valeur ${r * cols + c + 1}</td>`).join('')}</tr>`
    ).join('');
    insertHtmlAtCursor(`<table data-tmp-id="${markerId}"><tr>${headerCells}</tr>${bodyRows}</table>`);
    setTablePopoverOpen(false);

    const newTable = el?.querySelector<HTMLTableElement>(`table[data-tmp-id="${markerId}"]`);
    if (newTable) {
      newTable.removeAttribute('data-tmp-id');
      const firstCell = newTable.rows[0]?.cells[0];
      const sel2 = window.getSelection();
      if (firstCell && sel2) {
        const range = document.createRange();
        range.selectNodeContents(firstCell);
        range.collapse(true);
        sel2.removeAllRanges();
        sel2.addRange(range);
      }
      // insertHtmlAtCursor ci-dessus a déjà persisté (onChange) le HTML AVEC
      // data-tmp-id, avant qu'on ait pu le retirer du DOM : sans ce second
      // persist(), ce marqueur purement interne (retrouver le tableau juste
      // inséré) resterait dans le contenu enregistré en base — DOMPurify
      // (sanitizeLessonHtml) ne filtre pas les attributs data-* par défaut.
      persist();
    }
    setActiveTable(newTable ?? null);
  }, [tableRowsInput, tableColsInput, insertHtmlAtCursor, persist]);

  // Le bouton "Ajouter une image" ouvre le sélecteur de fichiers de
  // l'appareil (en sauvegardant d'abord le curseur courant) ; l'upload réel
  // a lieu dans handleImageSelected ci-dessous.
  const insertImage = useCallback(() => {
    const el = ref.current;
    const sel = window.getSelection();
    if (el && sel && sel.rangeCount > 0 && el.contains(sel.getRangeAt(0).commonAncestorContainer)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    } else {
      savedRangeRef.current = null;
    }
    imageInputRef.current?.click();
  }, []);

  const handleImageSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadLessonImage(file);
      const el = ref.current;
      const sel = window.getSelection();
      if (el && sel && savedRangeRef.current) {
        el.focus();
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
      insertHtmlAtCursor(`<img src="${url}" alt="${escapeHtml(file.name)}" />`);
      toast.success('Image ajoutée');
    } catch (error: any) {
      toast.error("Erreur lors de l'import de l'image", { description: error.message });
    } finally {
      setUploadingImage(false);
    }
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
  const ToolBtn = ({ onClick, children, title, disabled }: { onClick: () => void; children: React.ReactNode; title: string; disabled?: boolean }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 px-2 md:w-full justify-center whitespace-nowrap text-xs font-semibold shrink-0"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      dir="rtl"
    >
      {children}
    </Button>
  );

  const toolbar = (
    <div className="flex md:flex-col flex-row flex-wrap md:flex-nowrap items-center gap-1 p-1.5 bg-muted/50 border rounded-lg shrink-0 md:w-36 md:self-start md:sticky md:top-4 md:max-h-[calc(100vh-2rem)] md:overflow-y-auto">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelected}
      />
      {/* Les libellés des boutons sont en arabe (langue de travail du
          pédagogue), mais le texte inséré dans le contenu (titres, blocs
          Définition/Propriété/Exemple...) reste en français : ce sont deux
          paramètres distincts passés à insertHeading/insertBlock, jamais le
          libellé du bouton lui-même. */}
      <ToolBtn onClick={() => toggleInlineStyle('bold')} title="Gras">غامق</ToolBtn>
      <ToolBtn onClick={() => toggleInlineStyle('italic')} title="Italique">مائل</ToolBtn>

      <Separator orientation="horizontal" className="hidden md:block w-full my-1" />
      <Separator orientation="vertical" className="md:hidden h-6 mx-1" />

      <ToolBtn onClick={() => insertHeading(1, 'Titre')} title="Titre (numéroté automatiquement : 1, 2, 3...)">عنوان 1</ToolBtn>
      <ToolBtn onClick={() => insertHeading(2, 'Sous-titre')} title="Sous-titre (numéroté automatiquement : 1.1, 1.2...)">عنوان 2</ToolBtn>
      <ToolBtn onClick={() => insertHeading(3, 'Sous-sous-titre')} title="Sous-sous-titre (numéroté automatiquement : 1.1.1...)">عنوان 3</ToolBtn>

      <Separator orientation="horizontal" className="hidden md:block w-full my-1" />
      <Separator orientation="vertical" className="md:hidden h-6 mx-1" />

      <ToolBtn onClick={() => insertHtmlAtCursor('<ul><li>élément</li></ul>')} title="Liste à puces">قائمة نقطية</ToolBtn>
      <ToolBtn onClick={() => insertHtmlAtCursor('<ol><li>élément</li></ol>')} title="Liste numérotée">قائمة مرقمة</ToolBtn>

      <Separator orientation="horizontal" className="hidden md:block w-full my-1" />
      <Separator orientation="vertical" className="md:hidden h-6 mx-1" />

      <ToolBtn onClick={() => insertLatex(false)} title="Formule LaTeX en ligne ($...$)">صيغة</ToolBtn>
      <ToolBtn onClick={() => insertLatex(true)} title="Formule LaTeX en bloc ($$...$$)">معادلة</ToolBtn>

      <Separator orientation="horizontal" className="hidden md:block w-full my-1" />
      <Separator orientation="vertical" className="md:hidden h-6 mx-1" />

      <ToolBtn onClick={() => insertBlock('block-definition', 'Définition', 'Énoncé de la définition...')} title="Bloc Définition">تعريف</ToolBtn>
      <ToolBtn onClick={() => insertBlock('block-property', 'Propriété', 'Énoncé de la propriété...')} title="Bloc Propriété">خاصية</ToolBtn>
      <ToolBtn onClick={() => insertBlock('block-example', 'Exemple', "Énoncé de l'exemple...")} title="Bloc Exemple">مثال</ToolBtn>

      <Separator orientation="horizontal" className="hidden md:block w-full my-1" />
      <Separator orientation="vertical" className="md:hidden h-6 mx-1" />

      <Popover open={tablePopoverOpen} onOpenChange={setTablePopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 md:w-full justify-center whitespace-nowrap text-xs font-semibold shrink-0"
            onMouseDown={(e) => {
              e.preventDefault();
              const ctx = getTableContext();
              setActiveTable(ctx?.table ?? null);
              if (!ctx) {
                const el = ref.current;
                const sel = window.getSelection();
                if (el && sel && sel.rangeCount > 0 && el.contains(sel.getRangeAt(0).commonAncestorContainer)) {
                  savedRangeRef.current = sel.getRangeAt(0).cloneRange();
                } else {
                  savedRangeRef.current = null;
                }
              }
            }}
            title="Tableau"
            aria-label="Tableau"
            dir="rtl"
          >
            جدول
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
          {activeTable ? (
            <div>
              <p className="text-xs text-muted-foreground mb-2 px-1">
                Modifier le tableau (curseur placé dans une cellule)
              </p>
              <div className="grid gap-0.5">
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => addTableRow('above')} className="w-full text-left h-8 px-2 text-sm rounded hover:bg-muted">
                  Ajouter une ligne au-dessus
                </button>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => addTableRow('below')} className="w-full text-left h-8 px-2 text-sm rounded hover:bg-muted">
                  Ajouter une ligne en dessous
                </button>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={deleteTableRow} className="w-full text-left h-8 px-2 text-sm rounded hover:bg-muted">
                  Supprimer la ligne
                </button>
                <Separator className="my-1" />
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => addTableColumn('left')} className="w-full text-left h-8 px-2 text-sm rounded hover:bg-muted">
                  Ajouter une colonne à gauche
                </button>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => addTableColumn('right')} className="w-full text-left h-8 px-2 text-sm rounded hover:bg-muted">
                  Ajouter une colonne à droite
                </button>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={deleteTableColumn} className="w-full text-left h-8 px-2 text-sm rounded hover:bg-muted">
                  Supprimer la colonne
                </button>
                <Separator className="my-1" />
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={deleteTableEl} className="w-full text-left h-8 px-2 text-sm rounded hover:bg-muted text-destructive">
                  Supprimer le tableau
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs text-muted-foreground mb-2 px-1">Taille du tableau à insérer</p>
              <div className="flex items-end gap-2 mb-3">
                <div className="flex-1">
                  <Label htmlFor="inline-table-rows" className="text-xs text-muted-foreground">Lignes</Label>
                  <Input
                    id="inline-table-rows"
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
                  <Label htmlFor="inline-table-cols" className="text-xs text-muted-foreground">Colonnes</Label>
                  <Input
                    id="inline-table-cols"
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
              <Button type="button" size="sm" className="w-full" onMouseDown={(e) => e.preventDefault()} onClick={insertTable}>
                Insérer
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
      <ToolBtn onClick={insertImage} title="Ajouter une image depuis l'appareil" disabled={uploadingImage}>
        {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'صورة'}
      </ToolBtn>
      <ToolBtn onClick={insertHorizontalRule} title="Ajouter une ligne de séparation">خط فاصل</ToolBtn>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 md:w-full justify-center whitespace-nowrap text-xs font-semibold shrink-0"
            onMouseDown={(e) => e.preventDefault()}
            title="Couleur du texte"
            aria-label="Couleur du texte"
            dir="rtl"
          >
            لون
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

  // Position des boutons "+" flottants (coin haut-gauche = ajouter une
  // colonne, coin bas-droit = ajouter une ligne), calculée à chaque rendu
  // par rapport au conteneur (position:relative) à partir du rectangle réel
  // du tableau actif — ce calcul est intentionnellement synchrone (pas de
  // useLayoutEffect) pour rester toujours à jour avec le dernier DOM, y
  // compris juste après un ajout de ligne/colonne (voir `layoutTick`).
  let addColStyle: React.CSSProperties | undefined;
  let addRowStyle: React.CSSProperties | undefined;
  // Poignées de sélection/déplacement : une bande cliquable au-dessus de
  // chaque colonne (comme les lettres de colonne d'Excel) et une à gauche de
  // chaque ligne (comme les numéros de ligne).
  const colHandles: { index: number; style: React.CSSProperties }[] = [];
  const rowHandles: { index: number; style: React.CSSProperties }[] = [];
  if (activeTable && containerRef.current && containerRef.current.contains(activeTable)) {
    const tableRect = activeTable.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    addColStyle = {
      position: 'absolute',
      top: tableRect.top - containerRect.top - 14,
      left: tableRect.left - containerRect.left - 14,
    };
    addRowStyle = {
      position: 'absolute',
      top: tableRect.top - containerRect.top + tableRect.height - 14,
      left: tableRect.left - containerRect.left + tableRect.width - 14,
    };
    const headerRow = activeTable.rows[0];
    if (headerRow) {
      Array.from(headerRow.cells).forEach((cell, index) => {
        const cellRect = cell.getBoundingClientRect();
        colHandles.push({
          index,
          style: {
            position: 'absolute',
            top: tableRect.top - containerRect.top - 11,
            left: cellRect.left - containerRect.left,
            width: cellRect.width,
            height: 9,
          },
        });
      });
    }
    Array.from(activeTable.rows).forEach((row, index) => {
      const rowRect = row.getBoundingClientRect();
      rowHandles.push({
        index,
        style: {
          position: 'absolute',
          top: rowRect.top - containerRect.top,
          left: tableRect.left - containerRect.left - 11,
          width: 9,
          height: rowRect.height,
        },
      });
    });
  }

  return (
    <div className="flex flex-col md:flex-row gap-3" dir="ltr">
      {toolbar}
      <div ref={containerRef} className="relative flex-1 min-w-0">
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
            onMouseUp={updateActiveTable}
            onKeyUp={updateActiveTable}
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
            onMouseUp={updateActiveTable}
            onKeyUp={updateActiveTable}
            className={cn(EDITABLE_CLASSES, className)}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, [rehypeSanitize, lessonSchema]]}>
              {frozenMarkdown}
            </ReactMarkdown>
          </div>
        )}
        {addColStyle && (
          <button
            type="button"
            style={addColStyle}
            className="lesson-table-float-btn"
            title="Ajouter une colonne"
            aria-label="Ajouter une colonne"
            onMouseDown={(e) => e.preventDefault()}
            onClick={appendTableColumn}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        )}
        {addRowStyle && (
          <button
            type="button"
            style={addRowStyle}
            className="lesson-table-float-btn"
            title="Ajouter une ligne"
            aria-label="Ajouter une ligne"
            onMouseDown={(e) => e.preventDefault()}
            onClick={appendTableRow}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        )}
        {colHandles.map(({ index, style }) => (
          <button
            key={`col-handle-${index}`}
            type="button"
            draggable
            style={style}
            className={cn(
              'lesson-table-handle',
              structSelection?.type === 'col' && structSelection.index === index && 'lesson-table-handle-selected',
              dragOverHandle?.type === 'col' && dragOverHandle.index === index && 'lesson-table-handle-dragover',
            )}
            title={`Colonne ${index + 1} — cliquer pour sélectionner, glisser pour déplacer, Suppr pour supprimer`}
            aria-label={`Sélectionner la colonne ${index + 1}`}
            onClick={() => selectColumn(index)}
            onKeyDown={(e) => handleStripKeyDown(e, 'col', index)}
            onBlur={clearStructSelection}
            onDragStart={() => { dragFromRef.current = { type: 'col', index }; }}
            onDragOver={(e) => { e.preventDefault(); setDragOverHandle({ type: 'col', index }); }}
            onDragLeave={() => setDragOverHandle((d) => (d?.type === 'col' && d.index === index ? null : d))}
            onDrop={(e) => { e.preventDefault(); handleStripDrop('col', index); }}
            onDragEnd={() => { dragFromRef.current = null; setDragOverHandle(null); }}
          />
        ))}
        {rowHandles.map(({ index, style }) => (
          <button
            key={`row-handle-${index}`}
            type="button"
            draggable
            style={style}
            className={cn(
              'lesson-table-handle',
              structSelection?.type === 'row' && structSelection.index === index && 'lesson-table-handle-selected',
              dragOverHandle?.type === 'row' && dragOverHandle.index === index && 'lesson-table-handle-dragover',
            )}
            title={`Ligne ${index + 1} — cliquer pour sélectionner, glisser pour déplacer, Suppr pour supprimer`}
            aria-label={`Sélectionner la ligne ${index + 1}`}
            onClick={() => selectRow(index)}
            onKeyDown={(e) => handleStripKeyDown(e, 'row', index)}
            onBlur={clearStructSelection}
            onDragStart={() => { dragFromRef.current = { type: 'row', index }; }}
            onDragOver={(e) => { e.preventDefault(); setDragOverHandle({ type: 'row', index }); }}
            onDragLeave={() => setDragOverHandle((d) => (d?.type === 'row' && d.index === index ? null : d))}
            onDrop={(e) => { e.preventDefault(); handleStripDrop('row', index); }}
            onDragEnd={() => { dragFromRef.current = null; setDragOverHandle(null); }}
          />
        ))}
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
export default function InlineLessonEditor({ content, onChange, placeholder, className, resetKey, onFocusTarget, onBlurTarget, onDirty }: InlineLessonEditorProps) {
  return (
    <InlineLessonEditorInner
      key={resetKey}
      initialContent={content}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      onFocusTarget={onFocusTarget}
      onBlurTarget={onBlurTarget}
      onDirty={onDirty}
    />
  );
}
