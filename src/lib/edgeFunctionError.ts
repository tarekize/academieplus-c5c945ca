/**
 * Le SDK Supabase ne remonte, par défaut, qu'un message générique
 * ("Edge Function returned a non-2xx status code") quand une edge function
 * répond en erreur — le vrai motif (rôle refusé, quota, clé IA manquante...)
 * est dans le corps de la réponse HTTP, accessible via error.context.
 */
export async function extractFunctionErrorMessage(error: any): Promise<string> {
  try {
    const res: Response | undefined = error?.context;
    if (res && typeof res.clone === "function") {
      const body = await res.clone().json();
      if (body?.error) return body.error;
    }
  } catch { /* le corps n'est pas du JSON exploitable, on garde le message générique */ }
  return error?.message || "Erreur inconnue";
}
