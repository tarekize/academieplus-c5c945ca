import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TeacherEstablishmentStatus {
  // null tant que non résolu (on ne verrouille rien pendant le chargement, pour
  // éviter un flash de cases bloquées puis débloquées).
  hasEstablishment: boolean | null;
  hasActiveEstablishment: boolean | null;
}

/**
 * Reproduit la même règle de calcul de is_active que EstablishmentManager.tsx :
 * une ligne "establishments" jamais résolue vers un vrai compte établissement
 * (establishment_profile_id nul) est considérée active par défaut.
 */
export function useTeacherEstablishmentStatus(teacherId: string | undefined): TeacherEstablishmentStatus {
  const [hasEstablishment, setHasEstablishment] = useState<boolean | null>(null);
  const [hasActiveEstablishment, setHasActiveEstablishment] = useState<boolean | null>(null);

  useEffect(() => {
    if (!teacherId) return;
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("establishments" as any)
        .select("establishment_profile_id")
        .eq("teacher_id", teacherId);
      const rows = (data as any[]) || [];
      if (cancelled) return;

      if (rows.length === 0) {
        setHasEstablishment(false);
        setHasActiveEstablishment(false);
        return;
      }
      setHasEstablishment(true);

      const linkedIds = [...new Set(rows.map((r) => r.establishment_profile_id).filter(Boolean))] as string[];
      let inactiveSet = new Set<string>();
      if (linkedIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, is_active")
          .in("id", linkedIds);
        inactiveSet = new Set(
          ((profiles as any[]) || []).filter((p) => p.is_active === false).map((p) => p.id)
        );
      }
      if (cancelled) return;
      const anyActive = rows.some((r) => !r.establishment_profile_id || !inactiveSet.has(r.establishment_profile_id));
      setHasActiveEstablishment(anyActive);
    })();

    return () => { cancelled = true; };
  }, [teacherId]);

  return { hasEstablishment, hasActiveEstablishment };
}
