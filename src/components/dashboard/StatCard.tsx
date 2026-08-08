import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { type AppRole, roleAccent } from "@/components/layout/AppShell";

type DeltaTone = "success" | "warning" | "destructive" | "info" | "neutral" | "accent";

const TONE_CLASS: Record<Exclude<DeltaTone, "accent">, string> = {
  success: "text-badge-success-foreground",
  warning: "text-badge-warning-foreground",
  destructive: "text-badge-destructive-foreground",
  info: "text-badge-info-foreground",
  neutral: "text-text-muted-2",
};

interface StatCardProps {
  label: ReactNode;
  value: ReactNode;
  delta?: ReactNode;
  /** Couleur de la ligne "delta". "accent" utilise la couleur du profil (voir `role`). */
  deltaTone?: DeltaTone;
  role?: AppRole;
  className?: string;
}

/** Carte KPI (charte v2) : label uppercase muted, valeur Sora 24px/800, delta coloré. */
export function StatCard({ label, value, delta, deltaTone = "neutral", role, className }: StatCardProps) {
  const isAccent = deltaTone === "accent";
  return (
    <div className={cn("rounded-card border border-surface-border bg-card p-[18px] shadow-card-v2", className)}>
      <div className="font-body text-xs font-bold uppercase tracking-[0.03em] text-text-muted-2">{label}</div>
      <div className="my-1 font-heading text-2xl font-extrabold text-text-title">{value}</div>
      {delta && (
        <div
          className={cn("font-body text-xs font-bold", !isAccent && TONE_CLASS[deltaTone])}
          style={isAccent && role ? { color: roleAccent(role) } : undefined}
        >
          {delta}
        </div>
      )}
    </div>
  );
}
