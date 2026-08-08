import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { type AppRole, roleAccentSoft } from "@/components/layout/AppShell";

interface WelcomeBannerProps {
  role: AppRole;
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}

/** Bandeau de bienvenue (charte v2), partagé par les 6 tableaux de bord :
 * fond accentSoft (couleur du profil à faible opacité), titre Sora 20px/700. */
export function WelcomeBanner({ role, title, subtitle, className }: WelcomeBannerProps) {
  return (
    <div
      className={cn("rounded-card px-[22px] py-[22px] sm:px-[26px]", className)}
      style={{ background: roleAccentSoft(role) }}
    >
      <div className="font-heading text-xl font-bold text-text-title">{title}</div>
      {subtitle && <div className="mt-1 font-body text-[13px] text-text-body">{subtitle}</div>}
    </div>
  );
}
