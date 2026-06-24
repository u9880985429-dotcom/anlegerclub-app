"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, ShieldCheck, Crown } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
}

interface NavSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  ownerAdminOnly?: boolean;
  items: NavItem[];
  subgroups?: { title: string; items: NavItem[] }[];
}

const STAFF_NAV: NavSection = {
  title: "Mitarbeiter-Backend",
  icon: Users,
  items: [
    { href: "/admin", label: "Übersicht" },
    { href: "/admin/users", label: "Mitglieder" },
    { href: "/admin/subscriptions", label: "Subscriptions & Einladungen" },
    { href: "/admin/community", label: "Community-Moderation" },
    { href: "/admin/audit", label: "Audit-Log" },
  ],
};

const ADMIN_NAV: NavSection = {
  title: "Admin-Backend",
  icon: ShieldCheck,
  ownerAdminOnly: true,
  items: [
    { href: "/admin/kpi", label: "KPI-Dashboard" },
    { href: "/admin/kpi/sonstige-daten", label: "KPI - sonstige Daten" },
  ],
  subgroups: [
    {
      title: "Technisches Setup",
      items: [
        { href: "/admin/integrations", label: "Integrationen" },
        { href: "/admin/email-config", label: "E-Mail-Konfiguration" },
        { href: "/admin/domains", label: "Domains & SSL" },
        { href: "/admin/logs", label: "Datenlogs" },
        { href: "/admin/cookies", label: "Cookies & Einwilligungen" },
        { href: "/admin/fonts", label: "Schriftarten" },
        { href: "/admin/legal/agb", label: "Meine AGB" },
        { href: "/admin/legal/impressum", label: "Impressum" },
        { href: "/admin/legal/datenschutz", label: "Datenschutzerklärung" },
      ],
    },
  ],
};

const ADMIN_PREFIXES = [
  "/admin/kpi",
  "/admin/integrations",
  "/admin/email-config",
  "/admin/domains",
  "/admin/cookies",
  "/admin/fonts",
  "/admin/logs",
  "/admin/legal",
];

function detectArea(pathname: string): "staff" | "admin" {
  return ADMIN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/")) ? "admin" : "staff";
}

export function AdminSidebar({ isOwnerAdmin }: { isOwnerAdmin: boolean }) {
  const pathname = usePathname() ?? "";
  const area = detectArea(pathname);
  const section = area === "admin" && isOwnerAdmin ? ADMIN_NAV : STAFF_NAV;
  const SectionIcon = section.icon;

  return (
    <nav className="space-y-3 text-sm">
      <div
        className={`mb-2 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wider ${
          section.ownerAdminOnly ? "text-brand" : "text-muted-foreground"
        }`}
      >
        <SectionIcon className="h-3.5 w-3.5" />
        {section.title}
        {section.ownerAdminOnly && <Crown className="ml-auto h-3 w-3" />}
      </div>
      <div className="space-y-0.5">
        {section.items.map((it) => {
          const isActive = pathname === it.href || pathname.startsWith(it.href + "/");
          return (
            <Link
              key={it.href}
              href={it.href as never}
              className={`block rounded-md px-3 py-1.5 transition hover:bg-accent hover:text-foreground ${
                section.ownerAdminOnly ? "border border-brand/20 bg-brand/5" : ""
              } ${isActive ? "bg-accent font-semibold text-foreground" : "text-muted-foreground"}`}
            >
              {it.label}
            </Link>
          );
        })}
      </div>
      {section.subgroups?.map((sub) => (
        <div key={sub.title} className="mt-3">
          <div className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {sub.title}
          </div>
          <div className="space-y-0.5">
            {sub.items.map((it) => {
              const isActive = pathname === it.href || pathname.startsWith(it.href + "/");
              return (
                <Link
                  key={it.href}
                  href={it.href as never}
                  className={`block rounded-md border border-brand/15 bg-brand/[0.03] px-3 py-1.5 transition hover:bg-accent hover:text-foreground ${
                    isActive ? "border-brand bg-brand/10 font-semibold text-brand" : "text-muted-foreground"
                  }`}
                >
                  {it.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      {isOwnerAdmin && (
        <div className="mt-5 border-t border-border pt-3">
          {area === "staff" ? (
            <Link
              href="/admin/kpi"
              className="flex items-center gap-2 rounded-md border border-brand/30 bg-brand/5 px-3 py-2 text-xs text-brand transition hover:bg-brand/10"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Zum Admin-Backend
              <Crown className="ml-auto h-3 w-3" />
            </Link>
          ) : (
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <Users className="h-3.5 w-3.5" />
              Zum Mitarbeiter-Backend
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
