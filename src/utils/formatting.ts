// Utilitaires de formatage génériques (dates, texte, tailles de fichier),
// indépendants de la langue d'interface active (toujours en français ici —
// pour un formatage qui suit la langue FR/AR de l'utilisateur, voir plutôt
// src/lib/formatLocale.ts).
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

/** Date au format jj/mm/aaaa (français). */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd/MM/yyyy', { locale: fr });
}

/** Date + heure au format "jj/mm/aaaa à hh:mm" (français). */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd/MM/yyyy à HH:mm', { locale: fr });
}

/** Date relative ("il y a 3 jours") en français. */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: fr });
}

/** Coupe un texte à maxLength caractères et ajoute "…" si tronqué. */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/** Convertit un texte libre en slug URL (minuscules, accents retirés, tirets). */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Formate une taille en octets en unité lisible (Bytes/KB/MB/GB). */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/** Met en majuscule la première lettre d'un texte. */
export function capitalizeFirst(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Libellé FR d'un niveau de difficulté 1-5 (module Cours, dead code — voir utils/validation.ts). */
export function getDifficultyLabel(level: number): string {
  const labels: Record<number, string> = {
    1: 'Très facile',
    2: 'Facile',
    3: 'Moyen',
    4: 'Difficile',
    5: 'Très difficile',
  };
  return labels[level] || 'Non défini';
}

/** Libellé FR d'un statut de cours (brouillon/en_revision/publié/archivé). */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'brouillon': 'Brouillon',
    'en_revision': 'En révision',
    'publié': 'Publié',
    'archivé': 'Archivé',
  };
  return labels[status] || status;
}
