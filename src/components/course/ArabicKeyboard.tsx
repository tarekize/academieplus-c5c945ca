import {
  createContext, useContext, useRef, useState, useCallback, useEffect,
  type MutableRefObject, type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Keyboard, Delete, CornerDownLeft, X, GripHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

type EditableTarget = HTMLInputElement | HTMLTextAreaElement | HTMLElement;

// Disposition clavier arabe standard (AZERTY/QWERTY arabe)
const ROWS: string[][] = [
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'],
  ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'],
  ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ'],
  ['،', 'ذ', '؟', 'ٱ'],
];

const STORAGE_KEY = 'academieplus.arabicKeyboardPosition';
const COLLAPSED_WIDTH_GUESS = 180;
const COLLAPSED_HEIGHT_GUESS = 40;
const PANEL_WIDTH_GUESS = 320;
const PANEL_HEIGHT_GUESS = 300;
const DRAG_THRESHOLD = 4;
// Laisse le temps à un clic sur le clavier lui-même de s'exécuter avant de le
// masquer : le champ ne perd jamais réellement le focus en cliquant dessus
// (mousedown y est intercepté plus bas), donc ce délai ne se déclenche que
// pour un vrai clic ailleurs sur la page.
const HIDE_DELAY_MS = 150;

function isTextField(el: EditableTarget): el is HTMLInputElement | HTMLTextAreaElement {
  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
}

function nativeValueSetter(el: HTMLInputElement | HTMLTextAreaElement) {
  const proto = el instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  return Object.getOwnPropertyDescriptor(proto, 'value')?.set;
}

function insertIntoTarget(el: EditableTarget, text: string) {
  if (isTextField(el)) {
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const newValue = el.value.slice(0, start) + text + el.value.slice(end);
    nativeValueSetter(el)?.call(el, newValue);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    const cursor = start + text.length;
    requestAnimationFrame(() => el.setSelectionRange(cursor, cursor));
  } else if (el.isContentEditable) {
    document.execCommand('insertText', false, text);
  }
}

function deleteBeforeCursor(el: EditableTarget) {
  if (isTextField(el)) {
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const delStart = start === end ? Math.max(0, start - 1) : start;
    const newValue = el.value.slice(0, delStart) + el.value.slice(end);
    nativeValueSetter(el)?.call(el, newValue);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    requestAnimationFrame(() => el.setSelectionRange(delStart, delStart));
  } else if (el.isContentEditable) {
    document.execCommand('delete', false);
  }
}

interface Position {
  top: number;
  left: number;
}

function clamp(pos: Position, width: number, height: number): Position {
  if (typeof window === 'undefined') return pos;
  const maxLeft = Math.max(8, window.innerWidth - width - 8);
  const maxTop = Math.max(8, window.innerHeight - height - 8);
  return {
    top: Math.min(Math.max(8, pos.top), maxTop),
    left: Math.min(Math.max(8, pos.left), maxLeft),
  };
}

function loadPosition(): Position {
  if (typeof window === 'undefined') return { top: 110, left: 24 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.top === 'number' && typeof parsed?.left === 'number') {
        return clamp(parsed, COLLAPSED_WIDTH_GUESS, COLLAPSED_HEIGHT_GUESS);
      }
    }
  } catch { /* ignore */ }
  // Par défaut : juste au-dessus de la table des matières (barre latérale droite)
  return clamp({ top: 110, left: window.innerWidth - PANEL_WIDTH_GUESS - 24 }, COLLAPSED_WIDTH_GUESS, COLLAPSED_HEIGHT_GUESS);
}

interface ArabicKeyboardContextValue {
  focusField: (el: EditableTarget) => void;
  blurField: () => void;
}

const ArabicKeyboardContext = createContext<ArabicKeyboardContextValue | null>(null);

/**
 * À utiliser sur n'importe quel champ texte arabe (input, textarea, zone
 * contentEditable) pour l'enregistrer auprès du clavier virtuel global. Le
 * bouton/panneau ne s'affiche que pendant que ce champ (ou un autre champ
 * enregistré ailleurs sur la page) a le focus — jamais en permanence.
 */
export function useArabicKeyboardField() {
  const ctx = useContext(ArabicKeyboardContext);
  const onFocus = useCallback((el: EditableTarget) => ctx?.focusField(el), [ctx]);
  const onBlur = useCallback(() => ctx?.blurField(), [ctx]);
  return { onFocus, onBlur };
}

/**
 * Fournisseur unique du clavier arabe virtuel, monté une seule fois près de
 * la racine de l'app (voir App.tsx). Un seul widget est jamais rendu à la
 * fois, quel que soit le nombre de champs enregistrés via
 * useArabicKeyboardField() sur la page (barre de recherche, modale d'ajout
 * de chapitre/leçon, éditeur de leçon...), ce qui évite les doublons quand
 * plusieurs champs coexistent (ex : une modale ouverte par-dessus une page
 * qui a elle-même un champ arabe).
 */
export function ArabicKeyboardProvider({ children }: { children: ReactNode }) {
  const targetRef = useRef<EditableTarget | null>(null);
  const [visible, setVisible] = useState(false);
  // Nœud de la modale Radix (role="dialog") contenant le champ actif, s'il y
  // en a un — recalculé à chaque focus pour rester juste si le focus passe
  // d'un champ dans une modale à un champ hors modale (ou l'inverse).
  const [dialogHost, setDialogHost] = useState<HTMLElement | null>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>();

  const focusField = useCallback((el: EditableTarget) => {
    clearTimeout(hideTimeout.current);
    targetRef.current = el;
    const host = typeof el.closest === 'function' ? (el.closest('[role="dialog"]') as HTMLElement | null) : null;
    setDialogHost(host);
    setVisible(true);
  }, []);

  const blurField = useCallback(() => {
    hideTimeout.current = setTimeout(() => setVisible(false), HIDE_DELAY_MS);
  }, []);

  return (
    <ArabicKeyboardContext.Provider value={{ focusField, blurField }}>
      {children}
      {visible && <ArabicKeyboardWidget targetRef={targetRef} dialogHost={dialogHost} />}
    </ArabicKeyboardContext.Provider>
  );
}

interface ArabicKeyboardWidgetProps {
  targetRef: MutableRefObject<EditableTarget | null>;
  dialogHost: HTMLElement | null;
}

/**
 * Choisit le mode d'affichage du clavier selon que le champ actif se trouve
 * dans une modale Radix (role="dialog") ou non :
 * - dans une modale : rendu ancré à l'intérieur même de la modale (portail
 *   vers son propre nœud), pour qu'il en fasse réellement partie du point de
 *   vue du DOM — Radix ne peut alors jamais le traiter comme un clic "en
 *   dehors" qui ferme la modale, quel que soit son mécanisme de détection.
 * - ailleurs (page complète, barre de recherche...) : widget flottant,
 *   déplaçable, avec position mémorisée, comme avant.
 */
function ArabicKeyboardWidget({ targetRef, dialogHost }: ArabicKeyboardWidgetProps) {
  if (dialogHost) {
    return <InlineDialogKeyboard targetRef={targetRef} host={dialogHost} />;
  }
  return <FloatingKeyboard targetRef={targetRef} />;
}

function useOutsideCollapse(open: boolean, widgetRef: MutableRefObject<HTMLDivElement | null>, onCollapse: () => void) {
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (widgetRef.current?.contains(e.target as Node)) return;
      onCollapse();
    };
    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}

function KeyRows({ targetRef }: { targetRef: MutableRefObject<EditableTarget | null> }) {
  const withTarget = (fn: (el: EditableTarget) => void) => () => {
    const el = targetRef.current;
    if (el) fn(el);
  };

  return (
    <div className="p-2 space-y-1 border-t">
      {ROWS.map((row, i) => (
        <div key={i} className="flex gap-1 justify-center">
          {row.map((key) => (
            <Button
              key={key}
              type="button"
              variant="secondary"
              size="sm"
              className="h-9 w-9 p-0 text-base"
              onMouseDown={(e) => e.preventDefault()}
              onClick={withTarget((el) => insertIntoTarget(el, key))}
            >
              {key}
            </Button>
          ))}
        </div>
      ))}
      <div className="flex gap-1 justify-center pt-1">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-9 px-3"
          title="حذف"
          onMouseDown={(e) => e.preventDefault()}
          onClick={withTarget(deleteBeforeCursor)}
        >
          <Delete className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-9 flex-1"
          onMouseDown={(e) => e.preventDefault()}
          onClick={withTarget((el) => insertIntoTarget(el, ' '))}
        >
          مسافة
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-9 px-3"
          title="سطر جديد"
          onMouseDown={(e) => e.preventDefault()}
          onClick={withTarget((el) => insertIntoTarget(el, '\n'))}
        >
          <CornerDownLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Variante utilisée quand le champ actif est à l'intérieur d'une modale
 * Radix : ancrée dans un coin de la modale elle-même (portail vers le nœud
 * de la modale, pas document.body), sans glisser-déposer — la modale est de
 * toute façon centrée et de taille limitée.
 */
function InlineDialogKeyboard({ targetRef, host }: { targetRef: MutableRefObject<EditableTarget | null>; host: HTMLElement }) {
  const [open, setOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  useOutsideCollapse(open, widgetRef, () => setOpen(false));

  return createPortal(
    <div
      ref={widgetRef}
      dir="rtl"
      data-arabic-keyboard-widget=""
      className={cn(
        'absolute top-4 left-4 z-20 rounded-xl border bg-popover shadow-2xl',
        !open && 'w-fit',
        open && 'w-[300px]',
      )}
      onMouseDown={(e) => e.preventDefault()}
    >
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-t-xl bg-muted/60 text-sm font-medium whitespace-nowrap w-full"
      >
        <Keyboard className="h-4 w-4 shrink-0" />
        <span>لوحة المفاتيح العربية</span>
      </button>
      {open && <KeyRows targetRef={targetRef} />}
    </div>,
    host
  );
}

/**
 * Clavier arabe virtuel flottant, pour un champ hors de toute modale (page
 * complète, barre de recherche...). Le bouton lui-même est une pastille
 * flottante (position fixe) qui reste visible quel que soit le défilement
 * de la page, positionnée par défaut au-dessus de la table des matières.
 * Le pédagogue peut la faire glisser où il veut (position mémorisée), et le
 * panneau déployé ne se referme (vers la pastille) que via le bouton X ou un
 * clic en dehors — jamais en tapant une lettre.
 */
function FloatingKeyboard({ targetRef }: { targetRef: MutableRefObject<EditableTarget | null> }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position>({ top: 110, left: 24 });
  const [mounted, setMounted] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; startY: number; startTop: number; startLeft: number; moved: boolean } | null>(null);

  useEffect(() => {
    setPosition(loadPosition());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(position)); } catch { /* ignore */ }
  }, [position, mounted]);

  useOutsideCollapse(open, widgetRef, () => setOpen(false));

  const startDrag = (e: React.PointerEvent) => {
    dragState.current = { startX: e.clientX, startY: e.clientY, startTop: position.top, startLeft: position.left, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onDrag = (e: React.PointerEvent) => {
    const state = dragState.current;
    if (!state) return;
    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) state.moved = true;
    if (!state.moved) return;
    const el = widgetRef.current;
    const width = el?.offsetWidth ?? (open ? PANEL_WIDTH_GUESS : COLLAPSED_WIDTH_GUESS);
    const height = el?.offsetHeight ?? (open ? PANEL_HEIGHT_GUESS : COLLAPSED_HEIGHT_GUESS);
    setPosition(clamp({ top: state.startTop + dy, left: state.startLeft + dx }, width, height));
  };

  const endDrag = (e: React.PointerEvent) => {
    const state = dragState.current;
    dragState.current = null;
    // Un déplacement négligeable = un simple clic pour ouvrir/fermer
    if (state && !state.moved) {
      setOpen((o) => !o);
    }
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* ignore */ }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      ref={widgetRef}
      dir="rtl"
      data-arabic-keyboard-widget=""
      style={{ position: 'fixed', top: position.top, left: position.left, zIndex: 9999 }}
      className={cn(
        'rounded-xl border bg-popover shadow-2xl',
        !open && 'w-fit',
        open && 'w-[320px]',
      )}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div
        className="flex items-center justify-between gap-2 px-3 py-2 rounded-t-xl bg-muted/60 cursor-move touch-none select-none"
        onPointerDown={startDrag}
        onPointerMove={onDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="flex items-center gap-2 text-sm font-medium whitespace-nowrap">
          <Keyboard className="h-4 w-4 shrink-0" />
          <span>لوحة المفاتيح العربية</span>
        </div>
        {open ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setOpen(false)}
            title="إغلاق"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <GripHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </div>

      {open && <KeyRows targetRef={targetRef} />}
    </div>,
    document.body
  );
}
