import { supabase } from "@/integrations/supabase/client";

/**
 * Traduction à la volée, affichage uniquement — ne modifie jamais les
 * données d'origine ni la base. Sert de secours quand un chapitre/leçon n'a
 * de titre que dans une seule langue : plutôt que d'afficher l'autre langue
 * telle quelle, on la traduit via l'IA côté client, avec mise en cache
 * (mémoire + localStorage) pour ne jamais retraduire deux fois le même
 * texte.
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
    const primary = lang === "ar" ? pair.ar : pair.fr;
    const fallback = lang === "ar" ? pair.fr : pair.ar;

    if (primary && primary.trim()) {
      results[index] = primary;
      return;
    }
    if (!fallback || !fallback.trim()) {
      results[index] = fallback || "";
      return;
    }
    const cached = readCache(cacheKey(lang, fallback));
    if (cached) {
      results[index] = cached;
    } else {
      toTranslate.push({ index, text: fallback });
      results[index] = fallback; // repli immédiat pendant la traduction
    }
  });

  if (toTranslate.length === 0) return results;

  // Dédoublonne les textes identiques (ex: "Méthodologie de résolution de
  // problèmes" répété dans plusieurs chapitres) avant d'appeler l'IA.
  const uniqueTexts = Array.from(new Set(toTranslate.map((t) => t.text)));
  const BATCH_SIZE = 50;

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
