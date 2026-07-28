import { cn } from "@/lib/utils";

/**
 * Point rouge "nouveau contenu envoyé par l'enseignant" — pastille ping+dot,
 * à distinguer visuellement du badge rouge "en attente de validation admin"
 * (pilule pleine avec compteur) utilisé ailleurs dans l'app.
 */
export function TeacherContentRedDot({ show, className }: { show: boolean; className?: string }) {
  if (!show) return null;
  return (
    <span className={cn("absolute -top-1 -right-1 z-10 flex h-3.5 w-3.5", className)}>
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-background" />
    </span>
  );
}
