export const SECTION_TYPES = [
  { value: 'definition', label: 'DÃ©finition', color: 'blue' },
  { value: 'propriete', label: 'PropriÃ©tÃ©', color: 'green' },
  { value: 'exemple', label: 'Exemple', color: 'purple' },
  { value: 'methode', label: 'MÃ©thode', color: 'orange' },
  { value: 'remarque', label: 'Remarque', color: 'yellow' },
  { value: 'exercice', label: 'Exercice', color: 'red' },
] as const;

export const COURSE_STATUS = [
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'en_revision', label: 'En révision' },
  { value: 'publiÃ©', label: 'PubliÃ©' },
  { value: 'archivÃ©', label: 'ArchivÃ©' },
] as const;

export const DIFFICULTY_LEVELS = [
  { value: 1, label: 'TrÃ¨s facile' },
  { value: 2, label: 'Facile' },
  { value: 3, label: 'Moyen' },
  { value: 4, label: 'Difficile' },
  { value: 5, label: 'TrÃ¨s difficile' },
] as const;

export const MEDIA_TYPES = [
  { value: 'image', label: 'Image', accept: 'image/*' },
  { value: 'video', label: 'VidÃ©o', accept: 'video/*' },
  { value: 'audio', label: 'Audio', accept: 'audio/*' },
  { value: 'document', label: 'Document', accept: '.pdf,.doc,.docx' },
] as const;

export const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export const LATEX_TEMPLATES = [
  { label: 'Fraction', value: '\\frac{a}{b}' },
  { label: 'Racine carrÃ©e', value: '\\sqrt{x}' },
  { label: 'Puissance', value: 'x^{n}' },
  { label: 'IntÃ©grale', value: '\\int_{a}^{b} f(x) dx' },
  { label: 'Somme', value: '\\sum_{i=1}^{n} x_i' },
  { label: 'Limite', value: '\\lim_{x \\to a} f(x)' },
  { label: 'DÃ©rivÃ©e', value: '\\frac{df}{dx}' },
  { label: 'Matrice', value: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
] as const;

export const KEYBOARD_SHORTCUTS = {
  SAVE: 'Ctrl+S',
  PREVIEW: 'Ctrl+P',
  ADD_SECTION: 'Ctrl+Shift+N',
  UNDO: 'Ctrl+Z',
  REDO: 'Ctrl+Y',
} as const;
