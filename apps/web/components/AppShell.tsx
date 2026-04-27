"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  CandlestickChart,
  Briefcase,
  Compass,
  Bell,
  Settings,
  Shield,
  LogOut,
  ChevronDown,
  ChevronRight,
  Lock,
  Menu,
  X,
} from "lucide-react";
import { Logo } from "./Logo";
import { TutorialButton } from "./TutorialButton";
import { cn } from "@traderiq/ui";
import type { ProductSlug, Role } from "@traderiq/api";

interface AppShellProps {
  children: React.ReactNode;
  user: {
    firstName: string;
    lastName: string;
    role: Role;
    productSlug: ProductSlug;
  };
}

const PRODUCT_ICON: Record<Exclude<ProductSlug, "all-access">, React.ComponentType<{ className?: string }>> = {
  starter: Briefcase,
  trend: TrendingUp,
  stillhalter: CandlestickChart,
  cockpit: Compass,
};

const PRODUCT_LABEL: Record<Exclude<ProductSlug, "all-access">, string> = {
  starter: "Starter Depot",
  trend: "Trend Depot",
  stillhalter: "Stillhalter Depot",
  cockpit: "Trader Cockpit",
};

const DEPOT_SECTIONS: Record<Exclude<ProductSlug, "all-access">, { tab: string; label: string }[]> = {
  starter: [
    { tab: "welcome", label: "Welcome" },
    { tab: "strategie", label: "Strategie & Performance" },
    { tab: "aktiensparplan", label: "Trade Signale Aktiensparplan" },
    { tab: "dax", label: "Trade Signale DAX-Millionär" },
    { tab: "auswertungen", label: "Depotauswertungen" },
    { tab: "fokus", label: "Aktie im Fokus" },
    { tab: "broker", label: "Brokerempfehlung" },
    { tab: "community", label: "Community" },
    { tab: "archiv", label: "Archiv" },
  ],
  trend: [
    { tab: "welcome", label: "Welcome" },
    { tab: "start", label: "Strategie und Performance" },
    { tab: "signale", label: "Trade-Signale" },
    { tab: "auswertungen", label: "Depotauswertungen" },
    { tab: "broker", label: "Brokerempfehlung" },
    { tab: "community", label: "Community" },
    { tab: "archiv", label: "Archiv" },
  ],
  stillhalter: [
    { tab: "welcome", label: "Welcome" },
    { tab: "start", label: "Strategie und Performance" },
    { tab: "signale", label: "Trade-Signale" },
    { tab: "auswertungen", label: "Depotauswertungen" },
    { tab: "broker", label: "Brokerempfehlung" },
    { tab: "community", label: "Community" },
    { tab: "archiv", label: "Archiv" },
  ],
  cockpit: [
    { tab: "welcome", label: "Welcome" },
    { tab: "perspektiven", label: "Perspektiven" },
    { tab: "tag", label: "Tagesblick" },
    { tab: "woche", label: "Wochenblick" },
    { tab: "monat", label: "Monatsblick" },
    { tab: "earnings", label: "Anstehende Earnings" },
    { tab: "calendar", label: "Calendar" },
    { tab: "lexikon", label: "Lexikon" },
    { tab: "community", label: "Community" },
    { tab: "archiv", label: "Archiv" },
  ],
};

const ALL_DEPOTS: Exclude<ProductSlug, "all-access">[] = ["starter", "trend", "stillhalter", "cockpit"];

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams?.get("tab") ?? "";

  const [mobileOpen, setMobileOpen] = useState(false);

  // Drawer schließt sich automatisch bei Routen-Wechsel
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, activeTab]);

  // Body-Scroll sperren wenn Drawer offen
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const hasAllAccess = user.productSlug === "all-access";
  const isAccessible = (slug: Exclude<ProductSlug, "all-access">) =>
    hasAllAccess || user.productSlug === slug;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const isStaff = user.role === "STAFF" || user.role === "OWNER" || user.role === "ADMIN";

  const activeDepotMatch = pathname.match(/^\/depot\/([a-z]+)/);
  const activeDepotSlug = activeDepotMatch?.[1] && (DEPOT_SECTIONS as Record<string, unknown>)[activeDepotMatch[1]]
    ? (activeDepotMatch[1] as Exclude<ProductSlug, "all-access">)
    : undefined;

  const navigationContent = (
    <>
      <NavLink href="/dashboard" icon={LayoutDashboard} active={isActive("/dashboard")} label="Dashboard" />

      <div className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Depots</div>
      {ALL_DEPOTS.map((slug) => (
        <DepotMenu
          key={slug}
          slug={slug}
          icon={PRODUCT_ICON[slug]}
          label={PRODUCT_LABEL[slug]}
          sections={DEPOT_SECTIONS[slug]}
          isOpenByDefault={pathname.startsWith(`/depot/${slug}`)}
          pathname={pathname}
          activeTab={activeTab}
          locked={!isAccessible(slug)}
        />
      ))}

      <div className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account</div>
      <NavLink href="/notifications" icon={Bell} active={isActive("/notifications")} label="Benachrichtigungen" />
      <NavLink href="/settings" icon={Settings} active={isActive("/settings")} label="Einstellungen" />

      {isStaff && (
        <>
          <div className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-brand">Admin</div>
          <NavLink href="/admin" icon={Shield} active={isActive("/admin")} label="Admin-Backend" />
        </>
      )}
    </>
  );

  const userFooter = (
    <div className="flex items-center gap-3 px-2 py-2">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
        {user.firstName.charAt(0)}
        {user.lastName.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{user.firstName} {user.lastName}</div>
        <div className="truncate text-xs text-muted-foreground">{user.role}</div>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        title="Abmelden"
        className="rounded-md p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Sidebar (Desktop ≥1024px) */}
      <aside className="hidden w-72 flex-shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Logo variant="light" size="sm" />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3 text-sm">{navigationContent}</nav>
        <div className="border-t border-border p-3">{userFooter}</div>
      </aside>

      {/* Mobile Top-Bar mit Burger-Menü */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <Logo variant="light" size="sm" />
        <div className="flex items-center gap-1">
          <TutorialButton activeDepot={activeDepotSlug} userId={user.firstName + user.lastName} compact />
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Menü öffnen"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Menü schließen"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            style={{ animation: "fadeIn 0.15s ease-out" }}
          />
          {/* Drawer Panel */}
          <aside
            className="fixed inset-y-0 right-0 z-50 flex w-[85%] max-w-sm flex-col border-l border-border bg-card shadow-xl lg:hidden"
            style={{ animation: "slideInRight 0.2s ease-out", paddingTop: "env(safe-area-inset-top)" }}
            role="dialog"
            aria-modal="true"
            aria-label="Hauptnavigation"
          >
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <Logo variant="light" size="sm" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Menü schließen"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav
              className="flex-1 space-y-1 overflow-y-auto p-3 text-sm"
              onClick={(e) => {
                // Auto-close beim Klick auf einen Link
                const target = e.target as HTMLElement;
                if (target.closest("a")) setMobileOpen(false);
              }}
            >
              {navigationContent}
            </nav>
            <div
              className="border-t border-border p-3"
              style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
            >
              {userFooter}
            </div>
          </aside>
        </>
      )}

      {/* Content + Tutorial-Button (Desktop, top-right) */}
      <main className="relative flex-1 overflow-x-hidden">
        <div className="absolute right-4 top-4 z-30 hidden lg:block">
          <TutorialButton activeDepot={activeDepotSlug} userId={user.firstName + user.lastName} />
        </div>
        <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}

interface NavLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  label: string;
}

function NavLink({ href, icon: Icon, active, label }: NavLinkProps) {
  return (
    <Link
      href={href as never}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 transition",
        active ? "bg-brand/15 text-brand font-semibold" : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

interface DepotMenuProps {
  slug: Exclude<ProductSlug, "all-access">;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sections: { tab: string; label: string }[];
  isOpenByDefault: boolean;
  pathname: string;
  activeTab: string;
  locked?: boolean;
}

function DepotMenu({ slug, icon: Icon, label, sections, isOpenByDefault, pathname, activeTab, locked }: DepotMenuProps) {
  const [open, setOpen] = useState(isOpenByDefault);
  useEffect(() => {
    if (isOpenByDefault) setOpen(true);
  }, [isOpenByDefault]);

  const inDepot = pathname === `/depot/${slug}` || pathname.startsWith(`/depot/${slug}/`);
  const effectiveTab = activeTab || "welcome";

  if (locked) {
    return (
      <Link
        href={`/depot/${slug}` as never}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition",
          inDepot
            ? "bg-muted text-foreground"
            : "text-muted-foreground/70 hover:bg-accent hover:text-foreground",
        )}
        title={`${label} ist nicht abonniert – Vorschau anzeigen`}
      >
        <Icon className="h-4 w-4 flex-shrink-0 opacity-60" />
        <span className="flex-1">{label}</span>
        <Lock className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" aria-label="gesperrt" />
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition",
          inDepot ? "bg-brand/10 text-brand font-semibold" : "text-muted-foreground hover:bg-accent hover:text-foreground",
        )}
        aria-expanded={open}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1">{label}</span>
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {open && (
        <ul className="ml-2 mt-0.5 space-y-0.5 border-l border-border pl-2">
          {sections.map((s) => {
            const isActive = inDepot && effectiveTab === s.tab;
            return (
              <li key={s.tab}>
                <Link
                  href={`/depot/${slug}?tab=${s.tab}` as never}
                  className={cn(
                    "relative block rounded-md px-3 py-2 text-xs transition",
                    isActive
                      ? "bg-brand/10 font-semibold text-brand"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {isActive && (
                    <span
                      aria-hidden
                      className="absolute -left-2 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r bg-brand"
                    />
                  )}
                  {s.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
