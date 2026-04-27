import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/access";
import { Shield, Crown } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  /** Wenn true: nur fuer OWNER + ADMIN sichtbar (versteckt sich vor STAFF/MODERATOR komplett). */
  ownerAdminOnly?: boolean;
  /** Sektions-Trenner — wenn gesetzt, ist das ein Sektions-Header statt Link. */
  section?: string;
}

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Übersicht" },
  { href: "/admin/users", label: "Mitglieder" },
  { href: "/admin/subscriptions", label: "Subscriptions & Einladungen" },
  { href: "/admin/community", label: "Community-Moderation" },
  { href: "", label: "", section: "Konfiguration", ownerAdminOnly: true },
  { href: "/admin/integrations", label: "Integrationen", ownerAdminOnly: true },
  { href: "/admin/email-config", label: "E-Mail-Konfiguration", ownerAdminOnly: true },
  { href: "/admin/domains", label: "Domains & SSL", ownerAdminOnly: true },
  { href: "/admin/cookies", label: "Cookies & Einwilligungen", ownerAdminOnly: true },
  { href: "/admin/fonts", label: "Schriftarten", ownerAdminOnly: true },
  { href: "", label: "", section: "Daten" },
  { href: "/admin/logs", label: "Datenlogs", ownerAdminOnly: true },
  { href: "/admin/audit", label: "Audit-Log" },
  { href: "", label: "", section: "Auswertung", ownerAdminOnly: true },
  { href: "/admin/kpi", label: "KPI-Dashboard", ownerAdminOnly: true },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const role = session.user.role;
  if (role !== "STAFF" && role !== "OWNER" && role !== "ADMIN") {
    redirect("/dashboard");
  }
  const isOwnerAdmin = role === "OWNER" || role === "ADMIN";
  const navItems = ADMIN_NAV.filter((n) => !n.ownerAdminOnly || isOwnerAdmin);

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="card-base h-fit p-3 lg:sticky lg:top-6">
        <div className="mb-3 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wider text-brand">
          <Shield className="h-3.5 w-3.5" />
          Admin-Backend
        </div>
        <nav className="space-y-0.5 text-sm">
          {navItems.map((n, i) => {
            if (n.section) {
              return (
                <div
                  key={`section-${i}`}
                  className="mt-3 px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {n.section}
                </div>
              );
            }
            return (
              <Link
                key={n.href}
                href={n.href as never}
                className={`flex items-center justify-between rounded-md px-3 py-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground ${
                  n.ownerAdminOnly ? "border border-brand/20 bg-brand/5" : ""
                }`}
              >
                <span>{n.label}</span>
                {n.ownerAdminOnly && <Crown className="h-3 w-3 flex-shrink-0 text-brand/70" />}
              </Link>
            );
          })}
        </nav>
        <div className="mt-3 rounded-md border border-dashed border-border p-2 text-[10px] leading-snug text-muted-foreground">
          💡 Trade-Signale, Auswertungen, Aktie im Fokus, Marktupdates, Lexikon und Videos werden im jeweiligen Depot via <strong>Bearbeitungsmodus</strong> gepflegt.
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
