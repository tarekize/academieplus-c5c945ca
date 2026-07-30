import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface WelcomeBannerProps {
  eyebrow: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}

/** Bannière de bienvenue partagée par les pages "pro" (dashboard admin/élève,
 * enseignant, établissement) : même rayon, même padding, mêmes blobs décoratifs. */
export function WelcomeBanner({ eyebrow, title, subtitle, className }: WelcomeBannerProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl bg-[image:var(--gradient-primary)] px-6 py-7 sm:px-8 sm:py-8 text-primary-foreground shadow-[var(--shadow-elegant)]",
        className,
      )}
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden />
      <div className="absolute right-6 bottom-0 h-20 w-20 rounded-full bg-white/10" aria-hidden />
      <div className="relative">
        <p className="text-primary-foreground/75 text-sm font-medium uppercase tracking-wide">{eyebrow}</p>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold mt-1">{title}</h1>
        {subtitle && <p className="text-primary-foreground/80 text-sm mt-1.5">{subtitle}</p>}
      </div>
    </div>
  );
}
