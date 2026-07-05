import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardTileProps {
  icon: LucideIcon;
  iconBg: string;
  iconText: string;
  title: string;
  description: string;
  onClick: () => void;
}

export default function DashboardTile({ icon: Icon, iconBg, iconText, title, description, onClick }: DashboardTileProps) {
  return (
    <Card
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
      className={cn(
        "group cursor-pointer rounded-2xl border-border/60 transition-all duration-300",
        "hover:-translate-y-1 hover:border-transparent hover:shadow-[var(--shadow-card)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
    >
      <CardContent className="flex items-start gap-4 p-6">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110",
            iconBg,
            iconText,
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 space-y-1">
          <h3 className="flex items-center gap-1 font-semibold">
            {title}
            <ArrowRight className="h-4 w-4 -translate-x-1 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
          </h3>
          <p className="text-sm leading-snug text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
