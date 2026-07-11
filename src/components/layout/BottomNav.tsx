import { useLocation, useNavigate } from "react-router-dom";
import { Home, BookOpen, PenTool, Target, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  key: string;
  icon: typeof Home;
  label: string;
  path: string;
  match: (pathname: string) => boolean;
}

const ITEMS: NavItem[] = [
  { key: "home", icon: Home, label: "الرئيسية", path: "/dashboard", match: (p) => p === "/dashboard" },
  { key: "lessons", icon: BookOpen, label: "الدروس", path: "/liste-cours", match: (p) => p.startsWith("/liste-cours") || p.startsWith("/cours") },
  { key: "practice", icon: PenTool, label: "تمارين", path: "/cours/math", match: () => false },
  { key: "exams", icon: Target, label: "المراجعة", path: "/exams", match: (p) => p.startsWith("/exams") || p.startsWith("/revision") },
  { key: "account", icon: User, label: "حسابي", path: "/account", match: (p) => p.startsWith("/account") },
];

/** Mobile bottom tab bar (élève only) — fixed, glass, elevated center action. */
export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0.5rem)" }}
    >
      <div className="bottom-nav-glass mx-auto max-w-md flex items-center justify-around px-2 py-2 mb-3">
        {ITEMS.map((item) => {
          const isCenter = item.key === "practice";
          const isActive = item.match(location.pathname);
          const Icon = item.icon;

          if (isCenter) {
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.path)}
                aria-label={item.label}
                className="relative -mt-6 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[image:var(--gradient-primary)] text-white shadow-lg animate-pulse-soft active:scale-95 transition-transform"
              >
                <Icon className="h-5 w-5" />
              </button>
            );
          }

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors min-w-[44px] min-h-[44px] justify-center",
                isActive ? "text-violet" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn("text-[10px]", isActive ? "font-extrabold" : "font-semibold")}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
