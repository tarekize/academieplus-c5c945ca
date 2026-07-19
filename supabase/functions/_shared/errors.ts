// error instanceof Error ? error.message : "Unknown error" perd toute
// information utile quand ce qui est intercepté n'est pas une vraie
// instance d'Error (ex: un objet brut) : le client ne reçoit alors que
// "Unknown error", impossible à diagnostiquer sans les logs serveur.
// Restitue toujours quelque chose d'exploitable.
export function describeError(error: unknown): string {
  if (error instanceof Error) {
    const withCode = error as Error & { code?: string; details?: string; hint?: string };
    const parts = [withCode.message];
    if (withCode.code) parts.push(`(code: ${withCode.code})`);
    if (withCode.hint) parts.push(`— ${withCode.hint}`);
    return parts.filter(Boolean).join(" ");
  }
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}
