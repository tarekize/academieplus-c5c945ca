import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, LogOut, Menu, Search, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { cn } from "@/lib/utils";

export type AppRole = "student" | "parent" | "teacher" | "etablissement" | "pedago" | "admin";

const ROLE_VAR: Record<AppRole, string> = {
  student: "--role-student",
  parent: "--role-parent",
  teacher: "--role-teacher",
  etablissement: "--role-etablissement",
  pedago: "--role-pedago",
  admin: "--role-admin",
};

/** CSS `hsl(var(--role-x))` for the given role — use in inline `style`, never
 * as a Tailwind class name (roles are dynamic, so JIT can't see them). */
export function roleAccent(role: AppRole): string {
  return `hsl(var(${ROLE_VAR[role]}))`;
}

/** Same accent at low opacity, for soft banner/badge backgrounds. */
export function roleAccentSoft(role: AppRole, alpha = 0.08): string {
  return `hsl(var(${ROLE_VAR[role]}) / ${alpha})`;
}

export interface AppShellNavItem {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  /** Route to navigate to (rendered as a <Link>). */
  to?: string;
  /** Alternative to `to` for pages driving an internal section instead of a route. */
  onClick?: () => void;
}

interface AppShellProps {
  role: AppRole;
  navItems: AppShellNavItem[];
  userName: string;
  initials: string;
  children: ReactNode;
  searchPlaceholder?: string;
  /** Extra controls shown in the topbar, before the notification bell. */
  topbarExtra?: ReactNode;
}

/**
 * Shared application shell (charte v2) : sidebar fixe 236px + topbar 72px,
 * utilisé par les 6 profils (student/parent/teacher/etablissement/pedago/
 * admin). Sous 1024px la sidebar devient un tiroir (drawer).
 */
export function AppShell({
  role,
  navItems,
  userName,
  initials,
  children,
  searchPlaceholder,
  topbarExtra,
}: AppShellProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const accent = roleAccent(role);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const closeDrawer = () => setDrawerOpen(false);

  const sidebar = (
    <div className="flex h-full w-[236px] shrink-0 flex-col bg-sidebar-ink px-3.5 py-5">
      <div className="flex items-center gap-2.5 px-2.5 pb-5">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] font-heading text-[15px] font-extrabold text-white"
          style={{ backgroundColor: accent }}
        >
          A+
        </div>
        <span className="font-heading text-[15px] font-bold text-white">{t("app.brand")}</span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item, i) => {
          const Icon = item.icon;
          const itemClass = cn(
            "flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-start font-body text-sm font-semibold transition-colors",
            item.active ? "bg-white/[0.08] text-white" : "text-text-muted-2 hover:bg-white/5 hover:text-white",
          );
          const inner = (
            <>
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} aria-hidden />
              <span className="truncate">{item.label}</span>
            </>
          );
          if (item.to) {
            return (
              <Link key={item.label} to={item.to} className={itemClass} onClick={closeDrawer}>
                {inner}
              </Link>
            );
          }
          return (
            <button
              key={item.label}
              type="button"
              className={itemClass}
              onClick={() => {
                item.onClick?.();
                closeDrawer();
              }}
            >
              {inner}
            </button>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-control px-3 py-2.5 text-start font-body text-sm font-semibold text-text-muted-2 transition-colors hover:bg-white/5 hover:text-white"
      >
        <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} aria-hidden />
        {t("app.logout")}
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-app-surface">
      {/* Desktop sidebar (>=1024px) */}
      <aside className="sticky top-0 hidden h-screen lg:flex">{sidebar}</aside>

      {/* Mobile/tablet drawer (<1024px) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 animate-in fade-in"
            onClick={closeDrawer}
            aria-hidden
          />
          <div className="absolute inset-y-0 start-0 animate-in slide-in-from-left rtl:slide-in-from-right shadow-2xl">
            {sidebar}
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center justify-between gap-3 border-b border-surface-border bg-background px-4 sm:px-[26px]">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-control text-text-body hover:bg-search-surface lg:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label={t("app.openMenu")}
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
            <div className="hidden h-10 w-[280px] items-center gap-2.5 rounded-control bg-search-surface px-3.5 sm:flex">
              <Search className="h-4 w-4 shrink-0 text-text-muted-2" strokeWidth={1.8} aria-hidden />
              <span className="truncate text-[13px] text-text-muted-2">
                {searchPlaceholder ?? t("app.search")}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 sm:gap-[18px]">
            {topbarExtra}
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-control text-text-body hover:bg-search-surface"
              aria-label={t("app.notifications")}
            >
              <Bell className="h-[19px] w-[19px]" strokeWidth={1.8} aria-hidden />
            </button>
            <LanguageToggle />
            <div className="flex items-center gap-2.5">
              <div
                className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full font-heading text-[13px] font-bold text-white"
                style={{ backgroundColor: accent }}
              >
                {initials}
              </div>
              <span className="hidden truncate text-[13px] font-bold text-text-title sm:block">{userName}</span>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
