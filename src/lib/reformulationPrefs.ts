// Suivi local (par chapitre) de la section "Reformulation simplifiée" du chatbot.
// Règle : si l'IA a proposé la section plus de THRESHOLD fois sans que l'élève
// ne l'ouvre jamais, on cesse de la demander à l'IA pour ce chapitre.

const THRESHOLD = 10;

type ReformState = { shown: number; clicked: boolean };

const storageKey = (chapterId: string) => `chatbot_reform_${chapterId}`;

export function getReformState(chapterId: string | null | undefined): ReformState {
  if (!chapterId) return { shown: 0, clicked: false };
  try {
    const raw = localStorage.getItem(storageKey(chapterId));
    if (!raw) return { shown: 0, clicked: false };
    const parsed = JSON.parse(raw);
    return { shown: Number(parsed?.shown) || 0, clicked: !!parsed?.clicked };
  } catch {
    return { shown: 0, clicked: false };
  }
}

export function incrementReformShown(chapterId: string | null | undefined): void {
  if (!chapterId) return;
  const state = getReformState(chapterId);
  if (state.clicked) return; // l'élève a déjà cliqué : plus besoin de compter
  try {
    localStorage.setItem(
      storageKey(chapterId),
      JSON.stringify({ shown: state.shown + 1, clicked: false }),
    );
  } catch {
    /* ignore */
  }
}

export function markReformClicked(chapterId: string | null | undefined): void {
  if (!chapterId) return;
  const state = getReformState(chapterId);
  try {
    localStorage.setItem(
      storageKey(chapterId),
      JSON.stringify({ shown: state.shown, clicked: true }),
    );
  } catch {
    /* ignore */
  }
}

export function shouldHideReform(chapterId: string | null | undefined): boolean {
  const state = getReformState(chapterId);
  return state.shown >= THRESHOLD && !state.clicked;
}

// Détecte la présence de la section "Reformulation simplifiée" dans une réponse.
export function hasReformMarker(text: string): boolean {
  if (!text) return false;
  return /🔄/.test(text) || /reformulation simplifi/i.test(text);
}
