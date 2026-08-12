import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Fusionne des classes Tailwind conditionnelles (clsx) en résolvant les
// conflits d'utilitaires (twMerge) — utilisé dans quasi tous les composants UI.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Choisit le texte (titre de chapitre/leçon, etc.) correspondant à la langue
 * d'interface active, avec repli sur l'autre langue si celle-ci est vide —
 * pour ne jamais afficher un contenu figé dans une langue quelle que soit
 * celle sélectionnée par l'utilisateur (FR <-> AR).
 */
export function localizedText(
  lang: string,
  fr?: string | null,
  ar?: string | null
): string {
  const primary = lang === "ar" ? ar : fr;
  const fallback = lang === "ar" ? fr : ar;
  return primary || fallback || "";
}
