"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
    { tab: "start", label: "Start" },
    { tab: "signale", label: "Trade-Signale" },
    { tab: "auswertungen", label: "Depotauswertungen" },
    { tab: "broker", label: "Brokerempfehlung" },
    { tab: "community", label: "Community" },
    { tab: "archiv", label: "Archiv" },
  ],
  stillhalter: [
    { tab: "welcome", label: "Welcome" },
    { tab: "start", label: "Start" },
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

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();

  const hasAllAccess = user.productSlug === "all-access";
  const accessibleDepots: Exclude<ProductSlug, "all-access">[] = hasAllAccess
    ? ["starter", "trend", "stillhalter", "cockpit"]
    : (user.productSlug !== "all-access" ? [user.productSlug as Exclude<ProductSlug, "all-access">] : []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const isStaff = user.role === "STAFF" || user.role === "OWNER" || user.role === "ADMIN";

  // Aktiver Depot-Slug aus dem aktuellen Pfad — für die Tutorial-Button-Logik
  const activeDepotMatch = pathname.match(/^\/depot\/([a-z]+)/);
  const activeDepotSlug = activeDepotMatch?.[1] && (DEPOT_SECTIONS as Record<string, unknown>)[activeDepotMatch[1]]
    ? (activeDepotMatch[1] as Exclude<ProductSlug, "all-access">)
    : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-72 flex-shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Logo variant="light" size="sm" />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3 text-sm">
          <NavLink href="/dashboard" icon={LayoutDashboard} active={isActive("/dashboard")} label="Dashboard" />

          <div className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Depots</div>
          {accessibleDepots.map((slug) => (
            <DepotMenu
              key={slug}
              slug={slug}
              icon={PRODUCT_ICON[slug]}
              label={PRODUCT_LABEL[slug]}
              sections={DEPOT_SECTIONS[slug]}
              isOpenByDefault={pathname.startsWith(`/depot/${slug}`)}
              pathname={pathname}
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
        </nav>
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
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
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <Logo variant="light" size="sm" />
        <div className="flex items-center gap-2">
          <TutorialButton activeDepot={activeDepotSlug} userId={user.firstName + user.lastName} compact />
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent"
            title="Abmelden"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Content + Tutorial-Button (desktop, top-right) */}
      <main className="relative flex-1 overflow-x-hidden">
        <div className="absolute right-4 top-4 z-30 hidden lg:block">
          <TutorialButton activeDepot={activeDepotSlug} userId={user.firstName + user.lastName} />
        </div>
        <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8 lg:py-8">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="sticky bottom-0 z-20 grid grid-cols-5 border-t border-border bg-card lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <MobileNavLink href="/dashboard" icon={LayoutDashboard} label="Home" active={isActive("/dashboard")} />
        <MobileNavLink
          href={hasAllAccess ? "/depot/starter" : `/depot/${user.productSlug}`}
          icon={Briefcase}
          label="Depot"
          active={pathname.startsWith("/depot")}
        />
        <MobileNavLink href="/notifications" icon={Bell} label="Inbox" active={isActive("/notifications")} />
        <MobileNavLink href="/settings" icon={Settings} label="Mehr" active={isActive("/settings")} />
        {isStaff && <MobileNavLink href="/admin" icon={Shield} label="Admin" active={isActive("/admin")} />}
      </nav>
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
}

function DepotMenu({ slug, icon: Icon, label, sections, isOpenByDefault, pathname }: DepotMenuProps) {
  const [open, setOpen] = useState(isOpenByDefault);
  useEffect(() => {
    if (isOpenByDefault) setOpen(true);
  }, [isOpenByDefault]);

  const active = pathname === `/depot/${slug}` || pathname.startsWith(`/depot/${slug}/`);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition",
          active ? "bg-brand/10 text-brand font-semibold" : "text-muted-foreground hover:bg-accent hover:text-foreground",
        )}
        aria-expanded={open}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1">{label}</span>
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {open && (
        <ul className="ml-2 mt-0.5 space-y-0.5 border-l border-border pl-2">
          {sections.map((s) => (
            <li key={s.tab}>
              <Link
                href={`/depot/${slug}?tab=${s.tab}` as never}
                className="block rounded-md px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MobileNavLink({
  href, icon: Icon, label, active,
}: { href: string; icon: React.ComponentType<{ className?: string }>; label: string; active: boolean }) {
  return (
    <Link
      href={href as never}
      className={cn(
        "flex flex-col items-center justify-center gap-1 py-2 text-xs",
        active ? "text-brand" : "text-muted-foreground",
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[10px] uppercase tracking-wider">{label}</span>
    </Link>
  );
}
