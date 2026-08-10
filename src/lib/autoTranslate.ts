import { supabase } from "@/integrations/supabase/client";

/**
 * Traduction à la volée, affichage uniquement — ne modifie jamais les
 * données d'origine ni la base. Sert de secours quand un chapitre/leçon n'a
 * de titre que dans une seule langue : plutôt que d'afficher l'autre langue
 * telle quelle, on la traduit via un service gratuit, sans clé ni IA
 * (edge function translate-text — MyMemory Translation API), avec mise en
 * cache (mémoire + localStorage) pour ne jamais retraduire deux fois le
 * même texte.
 */

const CACHE_PREFIX = "autoTranslate:";
const memCache = new Map<string, string>();

function cacheKey(lang: string, text: string): string {
  return `${lang}:${text}`;
}

function readCache(key: string): string | null {
  const mem = memCache.get(key);
  if (mem !== undefined) return mem;
  try {
    const stored = localStorage.getItem(CACHE_PREFIX + key);
    if (stored !== null) {
      memCache.set(key, stored);
      return stored;
    }
  } catch {
    // localStorage indisponible (mode privé, quota...) : on continue sans cache persistant.
  }
  return null;
}

function writeCache(key: string, value: string): void {
  memCache.set(key, value);
  try {
    localStorage.setItem(CACHE_PREFIX + key, value);
  } catch {
    // idem : la mise en cache mémoire suffit pour la session en cours.
  }
}

export interface LocalizedPair {
  fr?: string | null;
  ar?: string | null;
}

// Le champ "fr" de beaucoup de contenus (chapitres, leçons, examens...) a
// été rempli avec le même texte arabe que le champ "ar" au moment de la
// création (aucune vraie traduction française n'a jamais été saisie). Sans
// cette détection, `primary` paraît toujours "déjà rempli" et la traduction
// automatique ne se déclenche jamais quand l'interface passe en français.
const ARABIC_SCRIPT_RE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

function looksArabic(text: string): boolean {
  return ARABIC_SCRIPT_RE.test(text);
}

/**
 * Pour chaque paire {fr, ar}, renvoie le texte de la langue active s'il
 * existe déjà ; sinon renvoie une traduction automatique (mise en cache) de
 * l'autre langue. N'appelle l'IA que pour les textes réellement manquants et
 * pas déjà en cache — un chapitre déjà bilingue ne déclenche aucun appel.
 */
export async function resolveLocalizedTexts(
  pairs: LocalizedPair[],
  lang: "fr" | "ar"
): Promise<string[]> {
  const results = new Array<string>(pairs.length);
  const toTranslate: { index: number; text: string }[] = [];

  pairs.forEach((pair, index) => {
    if (lang === "ar") {
      // L'utilisateur a choisi l'arabe : le contenu (rédigé en arabe dans
      // l'immense majorité des cas) s'affiche tel quel, sans jamais appeler
      // la traduction.
      results[index] = pair.ar || pair.fr || "";
      return;
    }

    // lang === "fr" : on ne fait confiance au champ "fr" que s'il ne
    // contient pas de script arabe (sinon ce n'est qu'un doublon du champ
    // "ar", pas une vraie traduction française saisie par un auteur).
    const frCandidate = pair.fr && !looksArabic(pair.fr) ? pair.fr : null;
    if (frCandidate) {
      results[index] = frCandidate;
      return;
    }

    const source = pair.ar || pair.fr;
    if (!source || !source.trim()) {
      results[index] = source || "";
      return;
    }
    const cached = readCache(cacheKey(lang, source));
    if (cached) {
      results[index] = cached;
    } else {
      toTranslate.push({ index, text: source });
      results[index] = source; // repli immédiat pendant la traduction
    }
  });

  if (toTranslate.length === 0) return results;

  // Dédoublonne les textes identiques (ex: "Méthodologie de résolution de
  // problèmes" répété dans plusieurs chapitres) avant d'appeler l'IA.
  const uniqueTexts = Array.from(new Set(toTranslate.map((t) => t.text)));
  const BATCH_SIZE = 30;

  for (let i = 0; i < uniqueTexts.length; i += BATCH_SIZE) {
    const batch = uniqueTexts.slice(i, i + BATCH_SIZE);
    try {
      const { data, error } = await supabase.functions.invoke("translate-text", {
        body: { texts: batch, targetLang: lang },
      });
      if (error) throw error;
      const translations: string[] = data?.translations || [];
      batch.forEach((text, idx) => {
        const translated = translations[idx] || text;
        writeCache(cacheKey(lang, text), translated);
      });
    } catch (e) {
      console.error("Auto-translation failed:", e);
      // Repli : on garde le texte de l'autre langue déjà présent dans `results`.
    }
  }

  toTranslate.forEach(({ index, text }) => {
    const cached = readCache(cacheKey(lang, text));
    if (cached) results[index] = cached;
  });

  return results;
}

/**
 * Traduit un lot de contenus mono-langue (contenu de leçon, énoncé/solution/
 * aide d'exercice, question/option/explication de quiz — tout ce qui
 * n'existe qu'en arabe en base). Si `lang` est "ar", renvoie les textes tels
 * quels (le contenu est déjà rédigé en arabe, aucune traduction requise) ;
 * si "fr", traduit (avec cache mémoire + localStorage + cache serveur
 * partagé côté edge function) chaque texte manquant. Le balisage HTML et le
 * LaTeX sont protégés côté edge function, pas ici.
 */
export async function translateContentTexts(
  texts: (string | null | undefined)[],
  lang: "fr" | "ar"
): Promise<string[]> {
  const normalized = texts.map((t) => t || "");
  if (lang === "ar") return normalized;

  const results = [...normalized];
  const toTranslate: { index: number; text: string }[] = [];

  normalized.forEach((text, index) => {
    if (!text.trim() || !looksArabic(text)) return; // déjà en français ou vide
    const cached = readCache(cacheKey(lang, text));
    if (cached) {
      results[index] = cached;
    } else {
      toTranslate.push({ index, text });
    }
  });

  if (toTranslate.length === 0) return results;

  const uniqueTexts = Array.from(new Set(toTranslate.map((t) => t.text)));
  const BATCH_SIZE = 30;

  for (let i = 0; i < uniqueTexts.length; i += BATCH_SIZE) {
    const batch = uniqueTexts.slice(i, i + BATCH_SIZE);
    try {
      const { data, error } = await supabase.functions.invoke("translate-text", {
        body: { texts: batch, targetLang: lang },
      });
      if (error) throw error;
      const translations: string[] = data?.translations || [];
      batch.forEach((text, idx) => {
        const translated = translations[idx] || text;
        writeCache(cacheKey(lang, text), translated);
      });
    } catch (e) {
      console.error("Content auto-translation failed:", e);
    }
  }

  toTranslate.forEach(({ index, text }) => {
    const cached = readCache(cacheKey(lang, text));
    if (cached) results[index] = cached;
  });

  return results;
}
