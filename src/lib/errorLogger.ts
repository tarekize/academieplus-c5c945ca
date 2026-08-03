import { supabase } from "@/integrations/supabase/client";

// Best-effort : ne doit jamais lui-même faire planter l'app ni bloquer
// l'utilisateur si l'insertion échoue (hors ligne, RLS, etc.).
export function logClientError(context: string, error: unknown, metadata?: Record<string, unknown>): void {
  try {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack ?? null : null;
    supabase.auth.getUser().then(({ data }) => {
      supabase
        .from("error_logs")
        .insert({
          user_id: data.user?.id ?? null,
          context,
          message: message.slice(0, 2000),
          stack: stack?.slice(0, 4000) ?? null,
          url: typeof window !== "undefined" ? window.location.href : null,
          metadata: metadata ?? null,
        })
        .then(({ error: insertError }) => {
          if (insertError) console.error("[errorLogger] insert failed:", insertError.message);
        });
    });
  } catch (e) {
    console.error("[errorLogger] unexpected failure:", e);
  }
}

/** À appeler une fois au démarrage de l'app pour capter les erreurs non gérées. */
export function installGlobalErrorHandlers(): void {
  window.addEventListener("error", (event) => {
    logClientError("window.onerror", event.error ?? event.message);
  });
  window.addEventListener("unhandledrejection", (event) => {
    logClientError("unhandledrejection", event.reason);
  });
}
