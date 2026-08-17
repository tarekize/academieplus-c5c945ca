import { supabase } from "@/integrations/supabase/client";

export interface StudentSubscriptionRow {
  total_days: number | null;
  days_used: number | null;
  is_paused: boolean | null;
  last_tick_at: string | null;
}

/** Jours restants sur un abonnement premium IA élève, à partir de ses
 * compteurs bruts — même logique que useChatLimits.ts (chatbot) et
 * AdminContrats.tsx (computeSubStatus), gardée ici comme source partagée. */
export function computeRemainingDays(sub: StudentSubscriptionRow | null | undefined): number {
  if (!sub) return 0;
  const totalDays = Number(sub.total_days || 0);
  const daysUsed = Number(sub.days_used || 0);
  if (!sub.is_paused && sub.last_tick_at) {
    const elapsed = (Date.now() - new Date(sub.last_tick_at).getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, totalDays - (daysUsed + elapsed));
  }
  return Math.max(0, totalDays - daysUsed);
}

/** Un abonnement (déjà chargé, ex. link.subscription côté parent) est actif
 * tant qu'il lui reste des jours. */
export function isSubscriptionActive(sub: StudentSubscriptionRow | null | undefined): boolean {
  return computeRemainingDays(sub) > 0;
}

/** Vérifie si l'utilisateur a déjà un abonnement premium IA actif (dernier
 * en date) — requête directe, pour un appelant qui n'a pas déjà la ligne en
 * mémoire (ex: avertissement avant paiement redondant). */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("student_subscriptions")
    .select("total_days, days_used, is_paused, last_tick_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return isSubscriptionActive(data);
}
