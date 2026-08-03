// Extraction d'exercices/quiz/examens depuis un document importé (PDF, Word,
// image) par l'IA — utilisé par les boutons "Générer via un document" côté
// enseignant, pédago et admin. Le fichier n'est jamais stocké : son contenu
// est lu côté client puis envoyé une seule fois à l'edge function, qui ne le
// persiste pas non plus (mêmes garanties que l'Assistant éditorial existant).
import { supabase } from "@/integrations/supabase/client";
import { extractFunctionErrorMessage } from "@/lib/edgeFunctionError";
import { GeneratedItem } from "@/lib/teacherContent";

export const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024; // 20 Mo
const ACCEPTED_EXTENSIONS = ["pdf", "docx", "png", "jpg", "jpeg", "webp"];

export type DocumentPart = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };
/** "exact" = retranscrit fidèlement le document ; "improve" = génère des exercices
 * équivalents mais reformulés/améliorés par l'IA. Choisi une fois par l'utilisateur
 * avant l'import (pas de question posée par l'IA en cours de génération). */
export type ExtractMode = "exact" | "improve";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Impossible de lire le fichier."));
    reader.readAsDataURL(file);
  });
}

/** Convertit un fichier importé (pdf/docx/image) en "parts" à envoyer à l'IA. */
export async function fileToDocumentParts(file: File): Promise<DocumentPart[]> {
  if (file.size > MAX_DOCUMENT_SIZE) {
    throw new Error("Fichier trop volumineux (maximum 20 Mo).");
  }
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (ext === "doc") {
    throw new Error("Format .doc non supporté — utilisez .docx, PDF ou image.");
  }
  if (!ACCEPTED_EXTENSIONS.includes(ext)) {
    throw new Error("Format non supporté. Utilisez PDF, Word (.docx) ou une image.");
  }

  if (ext === "docx") {
    const arrayBuffer = await file.arrayBuffer();
    // Import dynamique (code-splitting) d'une dépendance versionnée réelle —
    // plus de chargement d'exécutable tiers depuis un CDN au runtime.
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = (result?.value || "").trim();
    if (!text) throw new Error("Impossible d'extraire le texte de ce document Word.");
    return [{ type: "text", text }];
  }

  const dataUrl = await readFileAsDataUrl(file);
  return [{ type: "image_url", image_url: { url: dataUrl } }];
}

/** Appelle l'edge function d'extraction et renvoie les items au même format que generateTeacherContent(). */
export async function extractContentFromDocument(
  contentType: "exercise" | "quiz" | "exam",
  parts: DocumentPart[],
  mode: ExtractMode = "exact",
): Promise<GeneratedItem[]> {
  const { data, error } = await supabase.functions.invoke("extract-content-from-document", {
    body: { contentType, parts, mode },
  });
  if (error) throw new Error(await extractFunctionErrorMessage(error));
  if ((data as any)?.error) throw new Error((data as any).error);
  const items = (data as any)?.items;
  return Array.isArray(items) ? items : [];
}
