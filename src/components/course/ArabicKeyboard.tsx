import { useRef, useState, useCallback, type MutableRefObject } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Keyboard, Delete, CornerDownLeft } from 'lucide-react';

type EditableTarget = HTMLInputElement | HTMLTextAreaElement | HTMLElement;

// Disposition clavier arabe standard (AZERTY/QWERTY arabe)
const ROWS: string[][] = [
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'],
  ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'],
  ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ'],
  ['،', 'ذ', '؟', 'ٱ'],
];

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

/** Partage la référence du champ actuellement ciblé par le clavier virtuel arabe. */
export function useArabicKeyboardTarget() {
  const ref = useRef<EditableTarget | null>(null);
  const bindTarget = useCallback((el: EditableTarget | null) => {
    if (el) ref.current = el;
  }, []);
  return { targetRef: ref, bindTarget };
}

interface ArabicKeyboardButtonProps {
  targetRef: MutableRefObject<EditableTarget | null>;
}

/** Bouton "clavier arabe" : ouvre un clavier virtuel qui insère les lettres
 * dans le dernier champ ciblé (input, textarea ou zone éditable), sans lui
 * faire perdre le focus (onMouseDown preventDefault). */
export function ArabicKeyboardButton({ targetRef }: ArabicKeyboardButtonProps) {
  const [open, setOpen] = useState(false);

  const withTarget = (fn: (el: EditableTarget) => void) => () => {
    const el = targetRef.current;
    if (el) fn(el);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onMouseDown={(e) => e.preventDefault()}
        >
          <Keyboard className="h-4 w-4" />
          لوحة المفاتيح العربية
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        dir="rtl"
        className="w-auto p-2"
        onMouseDown={(e) => e.preventDefault()}
      >
        <div className="space-y-1">
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
      </PopoverContent>
    </Popover>
  );
}
