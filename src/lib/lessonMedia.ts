import { supabase } from "@/integrations/supabase/client";

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo

/**
 * Importe une image depuis l'appareil du pédagogue vers le bucket de stockage
 * "lesson-media" (public en lecture, écriture réservée admin/pédago — voir
 * migration 20260723130000) et retourne son URL publique, prête à insérer
 * dans le contenu d'une leçon (bouton "Ajouter une image" des éditeurs).
 */
export async function uploadLessonImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error("Format non supporté. Utilisez JPG, PNG, GIF ou WebP.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Fichier trop volumineux. Maximum 5 Mo.");
  }

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("lesson-media")
    .upload(fileName, file, { cacheControl: "3600", upsert: false });
  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage.from("lesson-media").getPublicUrl(fileName);
  return publicUrl;
}
