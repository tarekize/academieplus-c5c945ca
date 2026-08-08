import { type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BadgeTone = "success" | "warning" | "info" | "destructive" | "neutral";

const BADGE_VARIANT: Record<BadgeTone, "success" | "warning" | "info" | "v2-destructive" | "neutral"> = {
  success: "success",
  warning: "warning",
  info: "info",
  destructive: "v2-destructive",
  neutral: "neutral",
};

export interface ListCardRow {
  id: string | number;
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  badgeTone?: BadgeTone;
  onClick?: () => void;
}

interface ListCardProps {
  title: ReactNode;
  rows: ListCardRow[];
  emptyLabel?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/** Carte "liste" (charte v2) : titre + lignes titre/sous-titre + badge pill à droite. */
export function ListCard({ title, rows, emptyLabel, footer, className }: ListCardProps) {
  return (
    <div className={cn("rounded-card border border-surface-border bg-card p-5", className)}>
      <div className="mb-3.5 font-heading text-[15px] font-bold text-text-title">{title}</div>
      <div className="flex flex-col gap-2.5">
        {rows.length === 0 ? (
          <p className="py-6 text-center font-body text-sm text-text-muted-2">
            {emptyLabel ?? "Aucun élément."}
          </p>
        ) : (
          rows.map((row) => {
            const Tag = row.onClick ? "button" : "div";
            return (
              <Tag
                key={row.id}
                type={row.onClick ? "button" : undefined}
                onClick={row.onClick}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-control bg-app-surface-alt px-3 py-2.5 text-start",
                  row.onClick && "transition-colors hover:bg-search-surface active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-body text-[13px] font-bold text-text-title">{row.title}</div>
                  {row.subtitle && (
                    <div className="truncate font-body text-xs text-text-muted-2">{row.subtitle}</div>
                  )}
                </div>
                {row.badge && (
                  <Badge
                    variant={row.badgeTone ? BADGE_VARIANT[row.badgeTone] : "neutral"}
                    className="shrink-0 whitespace-nowrap"
                  >
                    {row.badge}
                  </Badge>
                )}
              </Tag>
            );
          })
        )}
      </div>
      {footer}
    </div>
  );
}
