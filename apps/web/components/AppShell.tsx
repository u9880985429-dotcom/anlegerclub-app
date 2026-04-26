"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  TrendingUp,
  CandlestickChart,
  Briefcase,
  Compass,
  Users,
  Bell,
  Settings,
  Shield,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { Logo } from "./Logo";
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

const PRODUCT_ICON: Record<ProductSlug, React.ComponentType<{ className?: string }>> = {
  starter: Briefcase,
  trend: TrendingUp,
  stillhalter: CandlestickChart,
  cockpit: Compass,
  "all-access": LayoutDashboard,
};

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();

  const hasAllAccess = user.productSlug === "all-access";
  const accessibleDepots: { slug: Exclude<ProductSlug, "all-access">; label: string }[] = hasAllAccess
    ? [
        { slug: "starter", label: "Starter Depot" },
        { slug: "trend", label: "Trend Depot" },
        { slug: "stillhalter", label: "Stillhalter Depot" },
        { slug: "cockpit", label: "Trader Cockpit" },
      ]
    : (() => {
        if (user.productSlug === "all-access") return [];
        return [
          {
            slug: user.productSlug as Exclude<ProductSlug, "all-access">,
            label:
              user.productSlug === "starter"
                ? "Starter Depot"
                : user.productSlug === "trend"
                ? "Trend Depot"
                : user.productSlug === "stillhalter"
                ? "Stillhalter Depot"
                : "Trader Cockpit",
          },
        ];
      })();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const isStaff = user.role === "STAFF" || user.role === "OWNER" || user.role === "ADMIN";

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Logo variant="light" size="sm" />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3 text-sm">
          <NavLink href="/dashboard" icon={LayoutDashboard} active={isActive("/dashboard")}>
            Dashboard
          </NavLink>

          <div className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Depots
          </div>
          {accessibleDepots.map((d) => {
            const Icon = PRODUCT_ICON[d.slug];
            return (
              <NavLink key={d.slug} href={`/depot/${d.slug}`} icon={Icon} active={isActive(`/depot/${d.slug}`)}>
                {d.label}
              </NavLink>
            );
          })}

          <div className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Community
          </div>
          {accessibleDepots.map((d) => (
            <NavLink key={`c-${d.slug}`} href={`/community/${d.slug}`} icon={Users} active={pathname === `/community/${d.slug}`}>
              {d.label.replace(" Depot", "").replace("Trader ", "")}
            </NavLink>
          ))}

          <div className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Account
          </div>
          <NavLink href="/notifications" icon={Bell} active={isActive("/notifications")}>
            Benachrichtigungen
          </NavLink>
          <NavLink href="/settings" icon={Settings} active={isActive("/settings")}>
            Einstellungen
          </NavLink>

          {isStaff && (
            <>
              <div className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-brand">
                Admin
              </div>
              <NavLink href="/admin" icon={Shield} active={isActive("/admin")}>
                Admin-Backend
              </NavLink>
            </>
          )}
        </nav>
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
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
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <Logo variant="light" size="sm" />
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent"
          title="Abmelden"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8 lg:py-8">{children}</div>
      </main>

      {/* Mobile bottom nav (with safe-area-inset for notch devices) */}
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
        <MobileNavLink
          href={hasAllAccess ? "/community/starter" : `/community/${user.productSlug}`}
          icon={Users}
          label="Community"
          active={pathname.startsWith("/community")}
        />
        <MobileNavLink href="/notifications" icon={Bell} label="Inbox" active={isActive("/notifications")} />
        <MobileNavLink href="/settings" icon={Settings} label="Mehr" active={isActive("/settings")} />
      </nav>
    </div>
  );
}

interface NavLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  children: React.ReactNode;
  external?: boolean;
}

function NavLink({ href, icon: Icon, active, children, external }: NavLinkProps) {
  const className = cn(
    "flex items-center gap-3 rounded-md px-3 py-2 transition",
    active ? "bg-brand/15 text-brand" : "text-muted-foreground hover:bg-accent hover:text-foreground",
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        <Icon className="h-4 w-4" />
        <span className="flex-1">{children}</span>
        <ExternalLink className="h-3 w-3 opacity-50" />
      </a>
    );
  }
  return (
    <Link href={href as never} className={className}>
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </Link>
  );
}

function MobileNavLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
}) {
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
