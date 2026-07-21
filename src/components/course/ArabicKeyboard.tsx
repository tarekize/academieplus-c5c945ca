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
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>();

  const focusField = useCallback((el: EditableTarget) => {
    clearTimeout(hideTimeout.current);
    targetRef.current = el;
    setVisible(true);
  }, []);

  const blurField = useCallback(() => {
    hideTimeout.current = setTimeout(() => setVisible(false), HIDE_DELAY_MS);
  }, []);

  return (
    <ArabicKeyboardContext.Provider value={{ focusField, blurField }}>
      {children}
      {visible && <ArabicKeyboardWidget targetRef={targetRef} />}
    </ArabicKeyboardContext.Provider>
  );
}

interface ArabicKeyboardWidgetProps {
  targetRef: MutableRefObject<EditableTarget | null>;
}

/**
 * Clavier arabe virtuel flottant. Le bouton lui-même est une pastille
 * flottante (position fixe) qui reste visible quel que soit le défilement
 * de la page, positionnée par défaut au-dessus de la table des matières.
 * Le pédagogue peut la faire glisser où il veut (position mémorisée), et le
 * panneau déployé ne se referme (vers la pastille) que via le bouton X ou un
 * clic en dehors — jamais en tapant une lettre. Le widget entier disparaît
 * dès que le champ associé perd le focus (voir ArabicKeyboardProvider).
 */
function ArabicKeyboardWidget({ targetRef }: ArabicKeyboardWidgetProps) {
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

  // Replie le panneau déployé sur un clic en dehors du widget (jamais sur une touche)
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (widgetRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [open]);

  // Empêche tout clic sur le widget d'atteindre le document : Radix Dialog
  // détecte les clics "en dehors" via un listener natif posé sur `document`
  // (phase de bulles). Le widget est monté dans un portail à part
  // (document.body), donc un `stopPropagation()` React (qui suit l'arbre
  // React des portails, pas forcément l'arbre DOM réel dans tous les cas)
  // n'est pas fiable ici — on pose un vrai listener DOM natif, en phase de
  // capture, directement sur le nœud du widget, pour être certain d'arrêter
  // l'événement avant qu'il ne redescende/remonte jusqu'à `document`.
  useEffect(() => {
    const node = widgetRef.current;
    if (!node) return;
    const stop = (e: Event) => e.stopPropagation();
    node.addEventListener('pointerdown', stop, true);
    node.addEventListener('mousedown', stop, true);
    return () => {
      node.removeEventListener('pointerdown', stop, true);
      node.removeEventListener('mousedown', stop, true);
    };
  }, [mounted]);

  const withTarget = (fn: (el: EditableTarget) => void) => () => {
    const el = targetRef.current;
    if (el) fn(el);
  };

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
      // Empêche un clic sur le widget (portalé hors de toute modale Radix,
      // donc vu comme "en dehors" par son détecteur de clic extérieur) de
      // remonter jusqu'au document et de fermer une modale ouverte
      // (ex: "Nouveau chapitre") par-dessus laquelle il flotte.
      onPointerDown={(e) => e.stopPropagation()}
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
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setOpen(false)}
            title="إغلاق"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <GripHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </div>

      {open && (
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
      )}
    </div>,
    document.body
  );
}
